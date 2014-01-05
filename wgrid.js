var console = console || {
	log: function(text){}
};



var UserGridCtrlInterface = {
	onCreateCell : "function"
};

var grid;

var WGrid = Class.create({
    initialize: function (container, options) {
		this.userGridCtrl = null;
        this.container = $(container);		
		this.colShift = 0;
		this.rowShift = 0;
		this.visibleColsCount = 10;
		this.visibleRowsCount = 10;
		this.defautShiftCellsCount = 1;
		this.highlightedElem = null;
		this.selectedValues = new Array();
		this.disabledValues = new Array();
		this.data = null;
        this.options = options || {};
		this.init();		
		this.dispose();
    },
	matchInterface: function(instance, interface){ 
		for(var property in interface){		
			if(instance[property]==undefined || typeof instance[property] != interface[property] ){
				console.log(property + " > "+instance[property]+" > " + typeof instance[property] + "  =========> false");
				return false;
			}
		}
		return true;
	},
	init: function() {
		me = this;		
		// init user grid ctrl
		if(this.options.userGridCtrl){			
			if(this.matchInterface(this.options.userGridCtrl, UserGridCtrlInterface)){
				this.userGridCtrl = this.options.userGridCtrl;
			}else{
				console.log('userGridCtrl must match interface UserGridCtrlInterface!');
			}
		}else{
			console.log('no userGridCtrl was defined');
		}
		
		// init data
		if((!this.options.data.cols || this.options.data.cols.size() == 0) && (!this.options.data.rows || this.options.data.rows.size() == 0)) {
			console.log("missed data to be displayed !");
		}else {

			dataCols = this.options.data.cols;
			if(!this.options.data.cols || this.options.data.cols.size() == 0){
				dataCols = new Array({type:'VALUE', key:0, name:'Tous'});
			}

			dataRows = this.options.data.rows;
			if(!this.options.data.rows || this.options.data.rows.size() == 0) {
				dataRows = new Array({type:'VALUE', key:0, name:'Tous'});
			}
			
			this.data = {cols : dataCols , rows : dataRows};
			
			// init disabled values
			if(this.options.disabledValues){
				this.options.disabledValues.each(
					function(disabledValue){
						if(disabledValue.colId) id = 'CV'+disabledValue.colId;
						if(disabledValue.rowId) {
							if(id && id.length>0) id = id + '_';
							id = id + 'RV'+disabledValue.rowId;
						}
						if(id) me.disabledValues.push(id);
					}
				);
			}
			
			// init already selected values			
			if(this.options.alreadySelectedValues){
				this.options.alreadySelectedValues.each(
					function(selectedValue){
						if(selectedValue.colId) id = 'CV'+selectedValue.colId;
						if(selectedValue.rowId) {
							if(id && id.length>0) id = id + '_';
							id = id + 'RV'+selectedValue.rowId;
						}
						if(id) me.selectedValues.push(id);
					}
				);
			}
			
		}
	},
	
	// -------------------------------------------------------------------------------------
	// DRAW 
	// -------------------------------------------------------------------------------------

	dispose: function() {
		if(!this.data || ((!this.data.cols || this.data.cols.size() == 0) && (!this.data.rows || this.data.rows.size() == 0))) {
			alert("no data to be displayed !");
		}else {
			if(this.options.grid) {
				if(this.options.grid.visibleColsCount) this.visibleColsCount = this.options.grid.visibleColsCount;
				if(this.options.grid.visibleRowsCount) this.visibleRowsCount = this.options.grid.visibleRowsCount;
			}			

			// set colShift to last col if overflows all cols count
			allColsCount = this.getCellsCount(this.data.cols);			
			if(this.colShift >= allColsCount) this.colShift = allColsCount-1;
			// set rowShift to last row if overflows all rows count
			allRowsCount = this.getCellsCount(this.data.rows);
			if(this.rowShift >= allRowsCount) this.rowShift = allRowsCount-1;
			
			// get data cols range to be displayed
			displayedData = this.getDisplayedDataRange(this.data);
	
			//if(displayedData.cols.size() < this.visibleColsCount) this.visibleColsCount = displayedData.cols.size();
			//if(displayedData.rows.size() < this.visibleRowsCount) this.visibleRowsCount = displayedData.rows.size();
			
			var startTime = new Date().getTime();  
			var elapsedTime = 0;  
			this.draw(displayedData);
			elapsedTime = new Date().getTime() - startTime;  
			if(elapsedTime>1000) console.log('grid drawing takes ' + elapsedTime/1000 + 's no counting display time');  
		}
	},
	
	draw: function(data) {
		if(this.container.down()) {
			this.container.down().remove();
		}
		
		var me = this;
	
		// create table Grid
		var gridTable = new Element('table');

		// compute colspan for navigation cell top and bottom
		colspan = this.computeNavigationColSpan(data);
		// compute rowsopan for navigation cell left and right
		rowspan = this.computeNavigationRowSpan(data);
		
		/*
		* ROW 1 : cellNavigationTop
		*/
		
		// row 1
		var row = this.appendTr(gridTable);
		// empty cell cross topNavigation leftNavigation
		me.appendTd(row); 
		// cell navigation top
		shiftTopCell = me.appendNavTd(row,null,{'colspan' : colspan});
		// empty cell cross topNavigation rightNavigation
		me.appendTd(row); 

		/*
		* ROW 2 : cellNavigationLeft + emptyCrossCell(2) + colsLists + cellNavigationRight
		*/
		
		// row 2
		var row = this.appendTr(gridTable);
		// cell navigation left
		shiftLeftCell = me.appendNavTd(row,null,{'rowspan': rowspan});
		// empty cell cross colsLists/rowsLists and colsListsValues/rowsListsValues
		me.appendTd(row,null,{'colspan':2,'rowspan':2});
		// append colsLists
		data.cols.each(
				function(elm){
					if(elm.type == 'LIST'){
						if(elm.collapsed || !elm.elements || elm.elements.size() == 0){
							me.appendGridHdrListTd(row,elm.name,{'id':'CL'+elm.key,'rowspan': 2},elm.collapsed);
						}else{
							listColspan = elm.elements.size();
							me.appendGridHdrListTd(row,elm.name,{'id':'CL'+elm.key,'colspan':listColspan},elm.collapsed);
						}
					}
				}
			);

		// empty col for values without lists
		me.appendNavTd(row,null,{'height':'25px','colspan': this.getOrphanColsDisplayedCount(data)});
		// cell navigation right
		shiftRightCell = me.appendNavTd(row,null,{'rowspan': rowspan});

		/*
		* ROW 3 : colsListsValues
		*/
		
		// row 3
		var row = this.appendTr(gridTable);
		// append colsListsValues
		data.cols.each(
				function(elm){
					if(elm.type == 'LIST'){
						if(elm.collapsed || !elm.elements || elm.elements.size() == 0){
							null; // do Nothing
						}else{							
							elm.elements.each(
								function(listValue){
									me.appendGridHdrTd(row,listValue.name,{'id':'CV'+listValue.key});
							});
						}
					}else if(elm.type == 'VALUE'){
						me.appendGridHdrTd(row,elm.name,{'id':'CV'+elm.key});
					}
				}
			);
		
		/*
		* ROW 4+ : rowsLists + rowsListsValues + CellValues
		*/
		
		// rows headers and rows values
		data.rows.each(
				function(elm){
					var row = me.appendTr(gridTable);
					if(elm.type == 'LIST'){
						if(elm.collapsed || !elm.elements || elm.elements.size() == 0){
							me.appendGridHdrListTd(row,elm.name,{'id':'RL'+elm.key,'colspan': 2},elm.collapsed);
							// draw cellValues of ListRow
							data.cols.each(
									function(elm2){
										if(elm2.type == 'LIST'){
											if(elm2.collapsed || !elm2.elements || elm2.elements.size() == 0){
												me.appendGridValueTd(row,null,{'id':'CL'+elm2.key+'_RL'+elm.key});
											}else{							
												elm2.elements.each(
													function(colListValue){
														me.appendGridValueTd(row,null,{'id':'CV'+colListValue.key+'_RL'+elm.key});
												});
											}
										}else if(elm2.type == 'VALUE'){
											me.appendGridValueTd(row,null,{'id':'CV'+elm2.key+'_RL'+elm.key});
										}
									}
								);
						}else{
							listRowspan = elm.elements.size();
							me.appendGridHdrListTd(row,elm.name,{'id':'RL'+elm.key, 'rowspan' : listRowspan},elm.collapsed);
							createNewRow = false;
							elm.elements.each(
								function(rowListValue){
									if(createNewRow) row = me.appendTr(gridTable);
									me.appendGridHdrTd(row,rowListValue.name,{'id':'RV'+rowListValue.key});
									// draw cellValues of ListValue
									data.cols.each(
											function(elm2){
												if(elm2.type == 'LIST'){
													if(elm2.collapsed || !elm2.elements || elm2.elements.size() == 0){
														me.appendGridValueTd(row,null,{'id':'CL'+elm2.key+'_RV'+rowListValue.key});
													}else{							
														elm2.elements.each(
															function(colListValue){
																me.appendGridValueTd(row,null,{'id':'CV'+colListValue.key+'_RV'+rowListValue.key});
														});
													}
												}else if(elm2.type == 'VALUE'){
													me.appendGridValueTd(row,null,{'id':'CV'+elm2.key+'_RV'+rowListValue.key});
												}
											}
										);
									createNewRow = true;
							});
						}
					}else if(elm.type == 'VALUE'){
						// empty list cell
						me.appendTd(row,null,{'width':'75px'}); 
						// colValue cell
						me.appendGridHdrTd(row,elm.name,{'id':'RV'+elm.key});
						// draw cellValues of ListValue
						data.cols.each(
								function(elm2){
									if(elm2.type == 'LIST'){
										if(elm2.collapsed || !elm2.elements || elm2.elements.size() == 0){
											me.appendGridValueTd(row,null,{'id':'CL'+elm2.key+'_RV'+elm.key});
										}else{							
											elm2.elements.each(
												function(colListValue){
													me.appendGridValueTd(row,null,{'id':'CV'+colListValue.key+'_RV'+elm.key});
											});
										}
									}else if(elm2.type == 'VALUE'){
										me.appendGridValueTd(row,null,{'id':'CV'+elm2.key+'_RV'+elm.key});
									}
								}
							);
					}
				}
			);
		
		/*
		* ROW last : cellNavigationTop
		*/
		
		// row last
		var row = this.appendTr(gridTable);
		// empty cell cross bottomNavigation leftNavigation
		me.appendTd(row); 
		// cell navigation bottom
		shiftBottomCell = me.appendNavTd(row,null,{'colspan' : colspan});
		// empty cell cross bottomNavigation rightNavigation
		me.appendTd(row); 

		/*
		* SHIFT TOP RIGHT BOTTOM LEFT links and events
		*/
		
		// append top shifter link
		if(this.canShiftTop()){
			link = new Element('a',{'href':'javascript:null;'});
			link.appendChild(document.createTextNode("TOP"));
			shiftTopCell.appendChild(link);
			shiftTopCell.observe('click',this.shiftTop.bind(this));
		}else{
			shiftTopCell.appendChild(document.createTextNode("TOP"));			
		}
		// append left shifter link
		if(this.canShiftLeft()){
			link = new Element('a',{'href':'javascript:null;'});
			link.appendChild(document.createTextNode("LEFT"));
			shiftLeftCell.appendChild(link);
			shiftLeftCell.observe('click',this.shiftLeft.bind(this));
		}else{
			shiftLeftCell.appendChild(document.createTextNode("LEFT"));			
		}
		// append right shifter link
		if(this.canShiftRight()){
			link = new Element('a',{'href':'javascript:null;'});
			link.appendChild(document.createTextNode("RIGHT"));
			shiftRightCell.appendChild(link);
			shiftRightCell.observe('click',this.shiftRight.bind(this));
		}else{
			shiftRightCell.appendChild(document.createTextNode("RIGHT"));			
		}
		// append bottom shifter link
		if(this.canShiftBottom()){
			link = new Element('a',{'href':'javascript:null;'});
			link.appendChild(document.createTextNode("BOTTOM"));
			shiftBottomCell.appendChild(link);
			shiftBottomCell.observe('click',this.shiftBottom.bind(this));
		}else{
			shiftBottomCell.appendChild(document.createTextNode("BOTTOM"));
		}
		
		/*
		* finalize drawing
		*/
		this.container.appendChild(gridTable);
		// set styles
		if(!gridTable.hasClassName('gridTable')) gridTable.addClassName('gridTable');
		gridTable.observe('click',this.onMouseClick.bind(this));
		gridTable.observe('mousemove',this.onMouseMove.bind(this));
		gridTable.observe('mouseout',this.onMouseOut.bind(this));
	},
	
	// -------------------------------------------------------------------------------------
	// DRAW UTILS (append TD,TR)
	// -------------------------------------------------------------------------------------
		
	appendTr: function(tblElem){
		var newTr = new Element('tr');		
		tblElem.appendChild(newTr);
		return newTr;
	},
	appendTd: function(trElem, text, options){
		var newTd = new Element('td',options);	
		if(text) newTd.appendChild(document.createTextNode(text));		
		trElem.appendChild(newTd);
		return newTd;
	},
	appendGridHdrListTd: function(trElem, text, options,collapsed){
		newTd = this.appendTd(trElem, null, options);		
		if(text){
			div = new Element('div');
			div.appendChild(document.createTextNode(text));
			if(collapsed){
				div.addClassName('gridHdrListTdCollapsed');
			}else {
				div.addClassName('gridHdrListTdExpanded');
			}
			newTd.appendChild(div);		
		}
		if(!newTd.hasClassName('gridHdrListTd')) newTd.addClassName('gridHdrListTd');
		return newTd;
	},
	appendGridHdrTd: function(trElem, text, options){
		newTd = this.appendTd(trElem, null, options);
		if(text){
			div = new Element('div');
			div.appendChild(document.createTextNode(text));
			newTd.appendChild(div);		
		}
		if(!newTd.hasClassName('gridHdrTd')) newTd.addClassName('gridHdrTd');
		return newTd;
	},
	appendGridValueTd: function(trElem, text, options){
		newTd = this.appendTd(trElem, text, options);
		if(!newTd.hasClassName('gridValueTd')) newTd.addClassName('gridValueTd');
		this.updateCellDisplayedState(newTd);
		//if(newTd.id) newTd.appendChild(document.createTextNode(newTd.id))
		return newTd;
	},
	appendNavTd: function(trElem, text, options){
		newTd = this.appendTd(trElem, text, options);
		if(!newTd.hasClassName('navTd')) newTd.addClassName('navTd');			
		return newTd;
	},
	updateCellDisplayedState: function(elemTd){
		elemTd.innerHTML = '';
		cellState = this.getCellState(elemTd.id);
		
		if(!cellState.enabled){
			if(!elemTd.hasClassName('gridValueCellDisabled')) elemTd.addClassName('gridValueCellDisabled');
		}
		if(cellState.checkState == 'checked'){
			elemTd.removeClassName('gridValueCellMiChecked');
			if(!elemTd.hasClassName('gridValueCellChecked')) elemTd.addClassName('gridValueCellChecked');
		}else if(cellState.checkState == 'unchecked'){
			elemTd.removeClassName('gridValueCellChecked');
			elemTd.removeClassName('gridValueCellMiChecked');
		}else if(cellState.checkState == 'michecked'){
			elemTd.removeClassName('gridValueCellChecked');
			if(!elemTd.hasClassName('gridValueCellMiChecked')) elemTd.addClassName('gridValueCellMiChecked');
			elemTd.innerHTML = cellState.checkedCellsCount+'/'+cellState.cellsCount;
		}
			
		if(this.userGridCtrl) {
			this.userGridCtrl.onCreateCell(elemTd,cellState);
		}
	},
	
	// -------------------------------------------------------------------------------------
	// MOUSE EVENTS
	// -------------------------------------------------------------------------------------
	
	onMouseMove: function(event){
		var tdElem = event.findElement('td');
		if(tdElem){
			if(this.isGridValueCell(tdElem)) {
				this.highlight(tdElem,'gridValueTdHover');
			}else if(this.isGridHdrListCell(tdElem)) {
				this.highlight(tdElem,'gridHdrListTdHover');
			}else if(this.isGridHdrCell(tdElem)) {
				this.highlight(tdElem,'gridHdrTdHover');
			}else if(this.isNavCell(tdElem)) {
				this.highlight(tdElem,'navTdHover');
			}
		}
		
	},
	onMouseClick: function(event){
		var tdElem = event.findElement('td');
		if(tdElem){
			if(this.isGridValueCell(tdElem)) {
				this.toggleCheckState(tdElem);
			}else if(this.isGridHdrCell(tdElem)) {
				this.toggleCheckStateList(tdElem);
			}else if(this.isGridHdrListCell(tdElem)) {
				this.toggleCollapseState(tdElem);
				this.dispose();
			}
		}
		
	},
	onMouseOut: function(event){
		this.highlight(null);
	},
	highlight: function(elem, cssClass){
		if(this.highlightedElem) this.highlightedElem.removeClassName('*Hover');
		this.highlightedElem=null;
		if(elem){			
			this.highlightedElem = elem;
			if(!this.highlightedElem.hasClassName(cssClass)) this.highlightedElem.addClassName(cssClass);
		}
	},
	
	// -------------------------------------------------------------------------------------
	// GRID CELLS UTILS
	// -------------------------------------------------------------------------------------
	
	isGridValueCell: function(tdElem) {
		return tdElem && tdElem.hasClassName('gridValueTd');
	},
	isNavCell: function(tdElem) {
		return tdElem && tdElem.hasClassName('navTd');
	},
	isGridHdrListCell: function(tdElem) {
		return tdElem && tdElem.hasClassName('gridHdrListTd');
	},
	isGridHdrCell: function(tdElem) {
		return tdElem && tdElem.hasClassName('gridHdrTd');
	},
	getFlattenGridIds: function(elemTdId){
		me = this;
		ids = elemTdId.split("_");
		cols = new Array();
		rows = new Array();
		ids.each(
			function(id){
				if(id.match("CV[0-9]+")){
					cols.push(id);
				}else if(id.match("RV[0-9]+")){
					rows.push(id);
				}else if(id.match("CL[0-9]+")){					
					me.data.cols.each(
						function(elm){
							if(elm.type == 'LIST' && elm.key == id.substring(2)){
								if(elm.elements.size() == 0){
									cols.push(id);
								}else{
									elm.elements.each(
										function(elmCol){
											cols.push('CV'+elmCol.key);
										}
									);
								}
							}
						}
					);
				}else if(id.match("RL[0-9]+")){					
					me.data.rows.each(
						function(elm){
							if(elm.type == 'LIST' && elm.key == id.substring(2)){					
								if(elm.elements.size() == 0){
									rows.push(id);
								}else{
									elm.elements.each(
										function(elmRow){
											rows.push('RV'+elmRow.key);
										}
									);
								}
							}
						}
					);
				}
			}
		);
		
		idsList = new Array();
		cols.each(
			function(colId){
				rows.each(
					function(rowId){
						idsList.push(colId+"_"+rowId);
					}
				);
			}
		);
		return idsList;
	},
	getCellState: function(elemTdId) {
		me = this;
		count = 0;
		disCount = 0;
		checkedCount = 0;
		this.getFlattenGridIds(elemTdId).each(
			function(id){
				count++;
				if(me.selectedValues.indexOf(id) != -1) {
					checkedCount++;
				}
				if(me.disabledValues.indexOf(id) != -1) {					
					disCount++;
				}
			}
		);		
		
		disabled = (disCount>0 && disCount == count);
		
		if(checkedCount == 0) check = 'unchecked';
		else if(checkedCount == count) check = 'checked';
		else if(checkedCount < count) check = 'michecked';
		
		return {
				enabled : !disabled, 
				checkState : check, 
				cellsCount : count, 
				checkedCellsCount : checkedCount, 
				disabledCellsCount : disCount
				};
	},
	setDisabledGridValueCell: function(elemTd) {
		me = this;
		this.getFlattenGridIds(elemTd.id).each(
			function(id){
				if(me.disabledValues.indexOf(id) == -1) {
					me.disabledValues.push(id);
				}
			}
		);		
		this.updateCellDisplayedState(elemTd);
	},
	setCheckedGridValueCell: function(elemTd) {
		me = this;
		this.getFlattenGridIds(elemTd.id).each(
			function(id){
				if(me.selectedValues.indexOf(id) == -1 && me.disabledValues.indexOf(id) == -1) {
					me.selectedValues.push(id);
				}
			}
		);		
		this.updateCellDisplayedState(elemTd);
	},
	setUnCheckedGridValueCell: function(elemTd) {
		me = this;
		this.getFlattenGridIds(elemTd.id).each(
			function(id){				
				me.selectedValues.splice(me.selectedValues.indexOf(id), 1);
			}
		);		
		this.updateCellDisplayedState(elemTd);
	},
	toggleCheckState: function(elemTd){
	
		cellState = this.getCellState(elemTd.id);
		
		if(cellState.enabled){
			if(cellState.checkState == 'checked' || cellState.checkState == 'michecked'){
				this.setUnCheckedGridValueCell(elemTd);
			}else {
				this.setCheckedGridValueCell(elemTd);
			}		
		}
	},
	toggleCheckStateList: function(elemTd){
		console.log('implement WGrid.toggleCheckStateList()');
		// TODO
	},
	toggleCollapseState: function(elemTd){
		if(elemTd.id.startsWith('C')){ // column
			this.data.cols.each(
				function(elm){
					if(elm.type == 'LIST' && elm.key == elemTd.id.substring(2)){					
						elm.collapsed = !elm.collapsed;
					}
				}
			);
		}else if(elemTd.id.startsWith('R')){ // row
			this.data.rows.each(
				function(elm){
					if(elm.type == 'LIST' && elm.key == elemTd.id.substring(2)){					
						elm.collapsed = !elm.collapsed;
					}
				}
			);
		}
	},
	getCellsCount: function(list){
		count = 0;
		list.each(
			function(elm){
				if(elm.type == 'LIST'){
					if(elm.collapsed || !elm.elements || elm.elements.size() == 0){
						count++;
					}else{
						count += elm.elements.size();
					}
				}else if(elm.type == 'VALUE'){
					count++;
				}
			});
		return count;
	},
	getOrphanCellsDisplayedCount: function(list){
		count = 0;
		list.each(
			function(elm){
				if(elm.type == 'VALUE'){
					count++;
				}
			});
		return count;
	},
	getOrphanColsDisplayedCount: function(data){
		return this.getOrphanCellsDisplayedCount(data.cols);
	},
	getOrphanRowsDisplayedCount: function(data){
		return this.getOrphanCellsDisplayedCount(data.rows);
	},
	computeNavigationColSpan: function(data){
		return this.getCellsCount(data.cols) + 2;
	},
	computeNavigationRowSpan: function(data){
		return this.getCellsCount(data.rows) + 2;
	},
	getDisplayedListRange: function(list,shift,visibleCount){
		displayedList = new Array();
		minIndex = shift;
		maxIndex = shift + visibleCount + 1;
		index = 0;
		list.each(
			function(elm){
				if(elm.type == 'VALUE'){
					index++;
					if(index > minIndex && index < maxIndex){
						displayedList.push(elm);
					}
				}else if(elm.type == 'LIST'){
					if(elm.collapsed || !elm.elements || elm.elements.size() == 0){					
						index++;
						if(index > minIndex && index < maxIndex){
							displayedList.push(elm);
						}
					}else{
						visibleElements = new Array();
						elm.elements.each(
							function(listValue){
									index++;
									if(index > minIndex && index < maxIndex){
										visibleElements.push(listValue);
									}
							}
						);
						if(visibleElements && visibleElements.size()>0){
							modifiedElm = Object.clone(elm);
							modifiedElm.elements = visibleElements;
							displayedList.push(modifiedElm);
						}						
					}
				}
			}
		);
		return displayedList;
	},	
	getDisplayedDataRange: function(data){
		displayedCols = this.getDisplayedListRange(data.cols, this.colShift, this.visibleColsCount);
		displayedRows = this.getDisplayedListRange(data.rows, this.rowShift, this.visibleRowsCount);
		
		displayedData = {cols:displayedCols , rows:displayedRows}
		return displayedData;
	},	
	
	// -------------------------------------------------------------------------------------
	// GRID FILTER
	// -------------------------------------------------------------------------------------
	
	getFilteredList: function(list, filter){		
		if(list){
			filterRegEx = new RegExp(filter,'i');
			filteredList = list.findAll(
					function(elm){
						if(elm){
							if(elm.type == 'VALUE') {
								return elm.name.match(filterRegEx);
							}else if(elm.type == 'LIST') {
								if(elm.name.match(filterRegEx)){
									return true;
								}else{
									filteredValues = elm.elements.findAll(
										function(val){
											if(val) return val.name.match(filterRegEx);	
											return false;
										}
									);
									if(filteredValues && filteredValues.size()>0){										
										return true;
									}
								}
							}
						}
						return false;
					});
			if(!filteredList || filteredList.size() == 0){
				console.log("no result match the filter \""+filter+"\"");
				return null;
			}else{
				// filter values
				filteredListClone = new Array();
				filteredList.each(
					function(elm){
						if(elm.type == 'VALUE'){
							filteredListClone.push(elm);
						}else if(elm.type == 'LIST') {
							elm.collapsed = false;
							if(elm.name.match(filterRegEx)){
								filteredListClone.push(elm);
							}else{
								filteredValues = elm.elements.findAll(
									function(val){
										if(val) return val.name.match(filterRegEx);	
										return false;
									}
								);
								if(filteredValues && filteredValues.size()>0){
									modifiedElm = Object.clone(elm);
									modifiedElm.elements = filteredValues;									
									filteredListClone.push(modifiedElm);
								}
							}
						}
					}
				);
				return filteredListClone;
			}
		}
		return null;
	},
	filterCols: function(filter){
		filteredCols = this.getFilteredList(this.options.data.cols,filter);		
		if(filteredCols){
			this.data.cols = filteredCols;
			this.colShift= 0;
			this.dispose();
		}
	},
	filterRows: function(filter){
		filteredRows = this.getFilteredList(this.options.data.rows,filter);		
		if(filteredRows){
			this.data.rows = filteredRows;
			this.rowShift= 0;
			this.dispose();
		}
	},
	
	// -------------------------------------------------------------------------------------
	// SHIFT CELLS
	// -------------------------------------------------------------------------------------
	
	shiftTopCells: function(cellsToShift) {
		if(this.canShiftTop()) {
			this.rowShift = this.rowShift - cellsToShift;
			this.dispose();
		}
	},	
	shiftBottomCells: function(cellsToShift) {
		if(this.canShiftBottom()) {
			this.rowShift = this.rowShift + cellsToShift;
			this.dispose();
		}
	},
	shiftLeftCells: function(cellsToShift) {		
		if(this.canShiftLeft()) {
			this.colShift = this.colShift - cellsToShift;			
			this.dispose();
		}
	},
	shiftRightCells: function(cellsToShift) {
		if(this.canShiftRight()) {
			this.colShift = this.colShift + cellsToShift;
			this.dispose();
		}
	},

	// -------------------------------------------------------------------------------------
	// SHIFT CELLS DEFAULT
	// -------------------------------------------------------------------------------------
	
	shiftTop: function() {
		this.shiftTopCells(this.defautShiftCellsCount);
	},
	shiftBottom: function() {
		this.shiftBottomCells(this.defautShiftCellsCount);
	},
	shiftLeft: function() {
		this.shiftLeftCells(this.defautShiftCellsCount);
	},
	shiftRight: function() {
		this.shiftRightCells(this.defautShiftCellsCount);
	},
	
	// -------------------------------------------------------------------------------------
	// CAN SHIFT
	// -------------------------------------------------------------------------------------
	
	canShiftLeft: function() { 
		return this.colShift > 0;
	},
	canShiftRight: function() { 
		return this.getCellsCount(this.data.cols) - this.colShift > this.visibleColsCount; 
	},
	canShiftTop: function() { 
		return this.rowShift > 0; 
	},
	canShiftBottom: function() { 
		return this.getCellsCount(this.data.rows) - this.rowShift > this.visibleRowsCount; 
	},

	// -------------------------------------------------------------------------------------
	// OUTPUTS
	// -------------------------------------------------------------------------------------
	
	getSelectedPairs: function(){
		result = new Array();
		this.selectedValues.each(
			function(selectedId){
				ids = selectedId.split("_");
				elm = {};
				if(ids[0] && ids[0].startsWith('CV')) elm.col = ids[0].substring(2);
				if(ids[0] && ids[0].startsWith('RV')) elm.row = ids[0].substring(2);

				if(ids[1] && ids[1].startsWith('CV')) elm.col = ids[1].substring(2);
				if(ids[1] && ids[1].startsWith('RV')) elm.row = ids[1].substring(2);

				result.push(elm);
				
			}
		);
		this.selectedValues
		return result;
	}
	
});