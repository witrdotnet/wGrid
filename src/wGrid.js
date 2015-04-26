var console = console || {
	log: function(text){}
};

var UserGridCtrlInterface = {
	onCreateCell : "function",
	onUpdateCellState : "function",
	onSelectionChange : "function",
	onCreateCrossCell : "function",
	onGridTranspose : "function",
	onDrawComplete : "function"
};

var grid;

var WGrid = Class.create({
    initialize: function (container, options) {		
		this.userGridCtrl = null;
		this.transpose = false;
		this.preserveGridWidth = true;
		this.navigationVisible = true;
		this.navigationAlwaysVisible = true;
		this.navigationMode = 'BAR'; // 'SCROLL'/'BAR'
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
				console.log('userGridCtrl is now defined');
			}else{
				console.log('userGridCtrl must match interface UserGridCtrlInterface!');
			}
		}else{
			console.log('no userGridCtrl was defined');
		}
		
		// init grid options
		if(this.options.parameters["navigationVisible"] != undefined) this.navigationVisible = this.options.parameters.navigationVisible;
		if(this.options.parameters["navigationAlwaysVisible"] != undefined) this.navigationAlwaysVisible = this.options.parameters.navigationAlwaysVisible;
		if(this.options.parameters["navigationMode"] != undefined) this.navigationMode = this.options.parameters.navigationMode;
		if(this.options.parameters["preserveGridWidth"] != undefined) this.preserveGridWidth = this.options.parameters.preserveGridWidth;
		
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
			
			this.data = {cols : dataCols , rows : dataRows , colsTitle : this.options.data.colsTitle, rowsTitle : this.options.data.rowsTitle};
			
			// init disabled values
			if(this.options.disabledValues){
				this.disabledValues = this.options.disabledValues.clone();
			}
			
			// init already selected values			
			if(this.options.alreadySelectedValues){
				this.selectedValues = this.options.alreadySelectedValues.clone();
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
			if(this.options.parameters) {
				if(this.options.parameters.visibleColsCount) this.visibleColsCount = this.options.parameters.visibleColsCount;
				if(this.options.parameters.visibleRowsCount) this.visibleRowsCount = this.options.parameters.visibleRowsCount;
			}			

			// set colShift to last col if overflows all cols count
			allColsCount = this.getCellsCount(this.data.cols);			
			if(this.colShift > allColsCount - this.visibleColsCount) this.colShift = allColsCount - this.visibleColsCount;
			if(this.colShift<0) this.colShift = 0;
			// set rowShift to last row if overflows all rows count
			allRowsCount = this.getCellsCount(this.data.rows);
			if(this.rowShift > allRowsCount - this.visibleRowsCount) this.rowShift = allRowsCount - this.visibleRowsCount;
			if(this.rowShift<0) this.rowShift = 0;
			
			// get data cols range to be displayed
			displayedData = this.getDisplayedDataRange(this.data);
	
			var startTime = new Date().getTime();  
			var elapsedTime = 0;  
			this.draw(displayedData);
			elapsedTime = new Date().getTime() - startTime;  
			if(elapsedTime>1000) console.log('grid drawing takes ' + elapsedTime/1000 + 's no counting display time');  
		}
	},
	
	draw: function(data) {
	
		if(this.container.down()) this.container.down().remove();
		this.container.appendChild(new Element('div',{'class':'progress'}));		
		
		var me = this;
	
		// create table Grid
		var gridTable = new Element('table', {'cellpadding':'0px'});

		// gather stats for displayed data
		displayedGridStats = {cols : this.getGridStats(data.cols), rows : this.getGridStats(data.rows)};
		// gather stats for filtered data
		gridStats = {cols : this.getGridStats(this.data.cols), rows : this.getGridStats(this.data.rows)};
		// colspan for colsTitle
		colspan = displayedGridStats.cols.cells;
		// rowsopan for rowsTitle
		rowspan = displayedGridStats.rows.cells;
		
		colspanCross = 1;
		rowspanCross = 1;
		
		if(gridStats.rows.lists > 0) colspanCross++;
		if(gridStats.cols.lists > 0) rowspanCross++;
		
		colspanNavTopBottomBar = 0;
		rowspanNavLeftRightBar = 1;
		
		if(this.preserveGridWidth && (displayedGridStats.cols.cells < me.visibleColsCount)) colspanNavTopBottomBar++;
		/*
		* ROW 0 : shiftTopBar
		*/
		
		//  shiftTopBar (if navigation mode)
		if(me.isNavigationModeBar()){
			if(me.navigationVisible && (me.isNavigationAlwaysVisible() || me.canShiftTop())){
				var row = this.appendTr(gridTable);			
				me.appendNavTdTopLeft(row);
				shiftTopBar = me.appendNavTdTop(row,null,{'colspan':colspan + colspanCross + colspanNavTopBottomBar, 'align':'center'});				
				me.appendNavTdTopRight(row);
			}
		}
		
		/*
		* ROW 1 : colsTitle
		*/
		
		// row 1
		var row = this.appendTr(gridTable);
		// shiftLeftBar (if navigation mode)
		if(me.isNavigationModeBar()){
			if(me.navigationVisible && (me.isNavigationAlwaysVisible() || me.canShiftLeft())){
				shiftLeftBar = me.appendNavTdLeft(row,null,{'rowspan':rowspan + rowspanCross+rowspanNavLeftRightBar, 'align':'center'});				
			}
		}
		// empty cell cross colsTitle/rowsTitle and colsLists/rowsLists and colsListsValues/rowsListsValues
		crossTd = me.appendTd(row,null,{'colspan':colspanCross,'rowspan':rowspanCross, 'align':'center'});
		// allow user to customize empty crossCell
		if(this.userGridCtrl) {
			this.userGridCtrl.onCreateCrossCell(this, crossTd);
		}
		
		// colsTitle
		if(data.colsTitle) {
			me.appendGridHdrTdHorizontal(row,data.colsTitle,{'colspan':colspan});
		}else{
			me.appendTd(row,null,{'colspan':colspan});
		}
		// visible cols compensation
		if(this.preserveGridWidth && (displayedGridStats.cols.cells < me.visibleColsCount)){
			me.appendTd(row,null,{'rowspan':rowspan + rowspanCross + rowspanNavLeftRightBar,'width':((me.visibleColsCount - displayedGridStats.cols.cells)*95)+'px','style':'background-color:gray'})
		}
		
		// shiftRightBar (if navigation mode)
		if(me.isNavigationModeBar()){
			if(me.navigationVisible && (me.isNavigationAlwaysVisible() || me.canShiftRight())){
				shiftRightBar = me.appendNavTdRight(row,null,{'rowspan':rowspan + rowspanCross + rowspanNavLeftRightBar, 'align':'center'});				
			}
		}else{		
			// empty cell cross colsTitle, colsLists and colsListsValues with scroll bar top-bottom
			if(me.navigationVisible && (me.isNavigationAlwaysVisible() || me.canShiftTop() || me.canShiftBottom())){
				me.appendTd(row,null,{'rowspan':rowspanCross});
			}
		}

		/*
		* ROW 2 : colsLists + empty col for orphan colsValues
		*/
		
		// row 2
		if(gridStats.cols.lists > 0){
			var row = this.appendTr(gridTable);
			
			// append colsLists
			data.cols.each(
					function(elm){
						if(elm.type == 'LIST'){
							if(elm.collapsed || !elm.elements || elm.elements.size() == 0){
								me.appendGridHdrListTd(row,elm.name,{'object':elm, 'id':me.transcodeGridHdrListColId(elm.key),'rowspan': 2,'object':elm},elm.collapsed);
							}else{
								listColspan = elm.elements.size();
								me.appendGridHdrListTd(row,elm.name,{'object':elm, 'id':me.transcodeGridHdrListColId(elm.key),'colspan':listColspan,'object':elm},elm.collapsed);
							}
						}
					}
				);

			// empty col for values without lists
			if(displayedGridStats.cols.orphans > 0) me.appendTd(row,null,{'class':'gridHdrListOrphanTd gridHdrListColOrphanTd','colspan': displayedGridStats.cols.orphans});
		}
		
		/*
		* ROW 3 : rowsTitle + colsListsValues
		*/
		
		// row 3
		var row = this.appendTr(gridTable);

		// rowsTitle
		if(data.rowsTitle){
			me.appendGridHdrTdVertical(row,data.rowsTitle,{'colspan':colspanCross});
		}else{
			me.appendTd(row,null,{'colspan':colspanCross});
		}
		
		// append colsListsValues + orphanValues
		data.cols.each(
				function(elm){
					if(elm.type == 'LIST'){
						if(elm.collapsed || !elm.elements || elm.elements.size() == 0){
							null; // do Nothing
						}else{							
							elm.elements.each(
								function(listValue){
									me.appendGridHdrValueTd(row,listValue.name,{'id':me.transcodeGridHdrColId(listValue.key)});
							});
						}
					}else if(elm.type == 'VALUE'){
						me.appendGridHdrValueTd(row,elm.name,{'id':me.transcodeGridHdrColId(elm.key)});
					}
				}
			);
		
		/*
		* ROW 4+ : rowsLists + rowsListsValues + CellValues
		*/
		
		// rows headers and rows values
		var row = me.appendTr(gridTable);
		firstValuesRow = true;
		emptyCellForOrphansCreated = false;
		// rows headers and rows values
		data.rows.each(
				function(elm){
					if(!firstValuesRow) row = me.appendTr(gridTable);
					if(elm.type == 'LIST'){
						if(elm.collapsed || !elm.elements || elm.elements.size() == 0){
							me.appendGridHdrListTd(row,elm.name,{'object':elm, 'id':me.transcodeGridHdrListRowId(elm.key),'colspan': 2},elm.collapsed);
							// draw cellValues of ListRow
							data.cols.each(
									function(elm2){
										if(elm2.type == 'LIST'){
											if(elm2.collapsed || !elm2.elements || elm2.elements.size() == 0){
												me.appendGridValueTd(row,null,{'id':me.transcodeCLRL(elm2.key,elm.key)});
											}else{							
												elm2.elements.each(
													function(colListValue){
														me.appendGridValueTd(row,null,{'id':me.transcodeCVRL(colListValue.key,elm.key)});
												});
											}
										}else if(elm2.type == 'VALUE'){
											me.appendGridValueTd(row,null,{'id':me.transcodeCVRL(elm2.key,elm.key)});
										}
									}
								);
								//************
								if(firstValuesRow){
									if(me.navigationVisible && me.isNavigationModeScroll() && (me.isNavigationAlwaysVisible() || me.canShiftTop() || me.canShiftBottom())) {
										shiftTopBottomCell = me.appendNavTdTopBottom(row,null,{'rowspan':rowspan, 'class':'navTdTopBottom'});
									}
									firstValuesRow = false;
								}
								//*************
						}else{
							listRowspan = elm.elements.size();
							me.appendGridHdrListTd(row,elm.name,{'object':elm, 'id':me.transcodeGridHdrListRowId(elm.key), 'rowspan' : listRowspan},elm.collapsed);
							createNewRow = false;
							elm.elements.each(
								function(rowListValue){
									if(createNewRow) row = me.appendTr(gridTable);
									me.appendGridHdrValueTd(row,rowListValue.name,{'id':me.transcodeGridHdrRowId(rowListValue.key)});
									// draw cellValues of ListValue
									data.cols.each(
											function(elm2){
												if(elm2.type == 'LIST'){
													if(elm2.collapsed || !elm2.elements || elm2.elements.size() == 0){
														me.appendGridValueTd(row,null,{'id':me.transcodeCLRV(elm2.key,rowListValue.key)});
													}else{							
														elm2.elements.each(
															function(colListValue){
																me.appendGridValueTd(row,null,{'id':me.transcodeCVRV(colListValue.key,rowListValue.key)});
														});
													}
												}else if(elm2.type == 'VALUE'){
													me.appendGridValueTd(row,null,{'id':me.transcodeCVRV(elm2.key,rowListValue.key)});
												}
											}
										);
									createNewRow = true;
									//************									
									if(firstValuesRow){
										if(me.navigationVisible && me.isNavigationModeScroll() && (me.isNavigationAlwaysVisible() || me.canShiftTop() || me.canShiftBottom())) {
											shiftTopBottomCell = me.appendNavTdTopBottom(row,null,{'rowspan':rowspan, 'class':'navTdTopBottom'});
										}
										firstValuesRow = false;
									}
									//*************
							});
						}
					}else if(elm.type == 'VALUE'){
						// empty list cell
						if(gridStats.rows.lists > 0 && !emptyCellForOrphansCreated){
							me.appendTd(row,null,{'class':'gridHdrListOrphanTd gridHdrListRowOrphanTd','rowspan':displayedGridStats.rows.orphans}); 
							emptyCellForOrphansCreated = true;
						}
						// colValue cell
						me.appendGridHdrValueTd(row,elm.name,{'id':me.transcodeGridHdrRowId(elm.key)});
						// draw cellValues of ListValue
						data.cols.each(
								function(elm2){
									if(elm2.type == 'LIST'){
										if(elm2.collapsed || !elm2.elements || elm2.elements.size() == 0){
											me.appendGridValueTd(row,null,{'id':me.transcodeCLRV(elm2.key,elm.key)});
										}else{							
											elm2.elements.each(
												function(colListValue){
													me.appendGridValueTd(row,null,{'id':me.transcodeCVRV(colListValue.key,elm.key)});
											});
										}
									}else if(elm2.type == 'VALUE'){
										me.appendGridValueTd(row,null,{'id':me.transcodeCVRV(elm2.key,elm.key)});
									}
								}
							);
							//************							
							if(firstValuesRow){
								if(me.navigationVisible && me.isNavigationModeScroll() && (me.isNavigationAlwaysVisible() || me.canShiftTop() || me.canShiftBottom())) {
									shiftTopBottomCell = me.appendNavTdTopBottom(row,null,{'rowspan':rowspan, 'class':'navTdTopBottom'});
								}
								firstValuesRow = false;
							}
							//*************
					}
				}
			);
		
		/*
		* ROW last : cellNavigation left-right
		*/

		if(me.isNavigationModeScroll()){
			if(me.navigationVisible && (me.isNavigationAlwaysVisible() || me.canShiftLeft() || me.canShiftRight())){
				// row last
				var row = this.appendTr(gridTable);
				// empty cell cross navigation left-right with colList and cols
				me.appendTd(row,null,{'colspan' : colspanCross});
				// cell navigation left-right
				shiftLeftRightCell = me.appendNavTdLeftRight(row,null,{'colspan':colspan, 'class':'navTdLeftRight'});
			}
		}
		if(me.isNavigationModeBar()){
			if(me.navigationVisible && (me.isNavigationAlwaysVisible() || me.canShiftBottom())){
				// row last
				var row = this.appendTr(gridTable);
				me.appendNavTdBottomLeft(row);
				shiftBottomBar = me.appendNavTdBottom(row,null,{'colspan':colspan + colspanCross + colspanNavTopBottomBar, 'align':'center'});				
				me.appendNavTdBottomRight(row);
			}
		}

		/*
		* SHIFT TOP RIGHT BOTTOM LEFT links and events
		*/

		// scroll bar mode
		if(me.isNavigationModeScroll()){
			// set navigation left right buttons only when canShiftLeft or canShiftRight
			if(me.navigationVisible && (me.isNavigationAlwaysVisible() || me.canShiftLeft() || me.canShiftRight())){
				// append left shifter link
				navDisabled = this.canShiftLeft()?'':'-dis';
				link = new Element('a',{'href':'javascript:void(0);', 'class':'scrollLeft'+navDisabled, 'style':'float:left'});
				link.observe('click',this.shiftLeft.bind(this));
				shiftLeftRightCell.appendChild(link);
				// append right shifter link
				navDisabled = this.canShiftRight()?'':'-dis';
				link = new Element('a',{'href':'javascript:void(0);', 'class':'scrollRight'+navDisabled, 'style':'float:right'});
				link.observe('click',this.shiftRight.bind(this));
				shiftLeftRightCell.appendChild(link);
			}
			// set navigation top bottom buttons only when canShiftTop or canShiftBottom
			if(me.navigationVisible && (me.isNavigationAlwaysVisible() || me.canShiftTop() || me.canShiftBottom())){
				// append top shifter link
				navDisabled = this.canShiftTop()?'':'-dis';
				link = new Element('a',{'href':'javascript:void(0);', 'class':'scrollTop'+navDisabled});
				link.observe('click',this.shiftTop.bind(this));
				shiftTopBottomCell.appendChild(link);
				// space between shiftTop and shiftBottom		
				spacer = new Element('div',{'style':'height:'+((33*(rowspan))-42)+'px;'});		
				shiftTopBottomCell.appendChild(spacer);
				// append bottom shifter link
				navDisabled = this.canShiftBottom()?'':'-dis';
				link = new Element('a',{'href':'javascript:void(0);', 'class':'scrollBottom'+navDisabled});
				link.observe('click',this.shiftBottom.bind(this));
				shiftTopBottomCell.appendChild(link);
			}
		}
		
		// navigation mode
		if(me.isNavigationModeBar()){
			// set navigation left right buttons only when canShiftLeft or canShiftRight			
			if(me.navigationVisible && (me.isNavigationAlwaysVisible() || me.canShiftLeft())){
				// append left shifter link	
				navDisabled = this.canShiftLeft()?'':'-dis';
				link = new Element('a',{'href':'javascript:void(0);', 'class':'scrollLeft'+navDisabled, 'style':'float:left'});
				link.observe('click',this.shiftLeft.bind(this));
				shiftLeftBar.appendChild(link);
			}
			if(me.navigationVisible && (me.isNavigationAlwaysVisible() || me.canShiftRight())){
				// append right shifter link
				navDisabled = this.canShiftRight()?'':'-dis';
				link = new Element('a',{'href':'javascript:void(0);', 'class':'scrollRight'+navDisabled, 'style':'float:right'});
				link.observe('click',this.shiftRight.bind(this));
				shiftRightBar.appendChild(link);
			}
			// set navigation top bottom buttons only when canShiftTop or canShiftBottom
			if(me.navigationVisible && (me.isNavigationAlwaysVisible() || me.canShiftTop())){
				// append top shifter link
				navDisabled = this.canShiftTop()?'':'-dis';
				link = new Element('a',{'href':'javascript:void(0);', 'class':'scrollTop'+navDisabled});
				link.observe('click',this.shiftTop.bind(this));
				shiftTopBar.appendChild(link);
			}
			if(me.navigationVisible && (me.isNavigationAlwaysVisible() || me.canShiftBottom())){
				// append bottom shifter link
				navDisabled = this.canShiftBottom()?'':'-dis';
				link = new Element('a',{'href':'javascript:void(0);', 'class':'scrollBottom'+navDisabled});
				link.observe('click',this.shiftBottom.bind(this));
				shiftBottomBar.appendChild(link);
			}
		}
		
		
		/*
		* finalize drawing
		*/
		if(this.container.down()) this.container.down().remove();		
		this.container.appendChild(gridTable);
		// set styles
		if(!gridTable.hasClassName('gridTable')) gridTable.addClassName('gridTable');
		gridTable.observe('click',this.onMouseClick.bind(this));
		gridTable.observe('mousemove',this.onMouseMove.bind(this));
		gridTable.observe('mouseout',this.onMouseOut.bind(this));
		
		if(this.userGridCtrl) this.userGridCtrl.onDrawComplete(this);

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
	appendGridHdrTdHorizontal: function(trElem, text, options){
		newTd = this.appendGridHdrTd(trElem, text, options);
		if(!newTd.hasClassName('gridHdrTdHorizontal')) newTd.addClassName('gridHdrTdHorizontal');

		if(this.userGridCtrl) {
			this.userGridCtrl.onCreateCell(this,newTd,'HDR_TITLE_HORIZONTAL');
		}

		return newTd;
	},
	appendGridHdrTdVertical: function(trElem, text, options){
		newTd = this.appendGridHdrTd(trElem, text, options);
		if(!newTd.hasClassName('gridHdrTdVertical')) newTd.addClassName('gridHdrTdVertical');

		if(this.userGridCtrl) {
			this.userGridCtrl.onCreateCell(this,newTd,'HDR_TITLE_VERTICAL');
		}

		return newTd;
	},
	appendGridHdrListTd: function(trElem, text, options,collapsed){
		newTd = this.appendTd(trElem, null, options);				
		if(text){
			if(options && options.object) newTd.title = text;
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

		if(this.userGridCtrl) {
			this.userGridCtrl.onCreateCell(this,newTd,'HDR_LIST');
		}

		return newTd;
	},
	appendGridHdrValueTd: function(trElem, text, options){
		newTd = this.appendTd(trElem, null, options);
		if(text){
			div = new Element('div');
			div.appendChild(document.createTextNode(text));
			newTd.appendChild(div);		
		}
		if(!newTd.hasClassName('gridHdrValueTd')) newTd.addClassName('gridHdrValueTd');

		if(this.userGridCtrl) {
			this.userGridCtrl.onCreateCell(this,newTd,'HDR_VALUE');
		}

		return newTd;
	},
	appendGridValueTd: function(trElem, text, options){
		newTd = this.appendTd(trElem, text, options);
		if(!newTd.hasClassName('gridValueTd')) newTd.addClassName('gridValueTd');
		this.updateCellDisplayedState(newTd);

		if(this.userGridCtrl) {
			this.userGridCtrl.onCreateCell(this,newTd,'BODY_VALUE');
		}

		return newTd;
	},
	appendNavTd: function(trElem, text, options){
		newTd = this.appendTd(trElem, text, options);
		if(!newTd.hasClassName('navTd')) newTd.addClassName('navTd');			

		if(this.userGridCtrl) {
			this.userGridCtrl.onCreateCell(this,newTd,'HDR_NAV');
		}

		return newTd;
	},
	appendNavTdTop: function(trElem, text, options){
		newTd = this.appendNavTd(trElem, text, options);
		newTd.addClassName('navTdTop');
		if(this.userGridCtrl) this.userGridCtrl.onCreateCell(this,newTd,'HDR_NAV_TOP');
		return newTd;
	},
	appendNavTdTopLeft: function(trElem, text, options){
		newTd = this.appendNavTd(trElem, text, options);
		newTd.addClassName('navTdTopLeft');
		if(this.userGridCtrl) this.userGridCtrl.onCreateCell(this,newTd,'HDR_NAV_TOP_LEFT');
		return newTd;
	},
	appendNavTdTopRight: function(trElem, text, options){
		newTd = this.appendNavTd(trElem, text, options);
		newTd.addClassName('navTdTopRight');
		if(this.userGridCtrl) this.userGridCtrl.onCreateCell(this,newTd,'HDR_NAV_TOP_RIGHT');
		return newTd;
	},
	appendNavTdBottom: function(trElem, text, options){
		newTd = this.appendNavTd(trElem, text, options);
		newTd.addClassName('navTdBottom');
		if(this.userGridCtrl) this.userGridCtrl.onCreateCell(this,newTd,'HDR_NAV_BOTTOM');
		return newTd;
	},
	appendNavTdBottomLeft: function(trElem, text, options){
		newTd = this.appendNavTd(trElem, text, options);
		newTd.addClassName('navTdBottomLeft');
		if(this.userGridCtrl) this.userGridCtrl.onCreateCell(this,newTd,'HDR_NAV_BOTTOM_LEFT');
		return newTd;
	},
	appendNavTdBottomRight: function(trElem, text, options){
		newTd = this.appendNavTd(trElem, text, options);
		newTd.addClassName('navTdBottomRight');
		if(this.userGridCtrl) this.userGridCtrl.onCreateCell(this,newTd,'HDR_NAV_BOTTOM_RIGHT');
		return newTd;
	},
	appendNavTdLeft: function(trElem, text, options){
		newTd = this.appendNavTd(trElem, text, options);
		newTd.addClassName('navTdLeft');
		if(this.userGridCtrl) this.userGridCtrl.onCreateCell(this,newTd,'HDR_NAV_LEFT');
		return newTd;
	},
	appendNavTdRight: function(trElem, text, options){
		newTd = this.appendNavTd(trElem, text, options);
		newTd.addClassName('navTdRight');
		if(this.userGridCtrl) this.userGridCtrl.onCreateCell(this,newTd,'HDR_NAV_RIGHT');
		return newTd;
	},
	appendNavTdTopBottom: function(trElem, text, options){
		newTd = this.appendNavTd(trElem, text, options);
		newTd.addClassName('navTdTopBottom');
		if(this.userGridCtrl) this.userGridCtrl.onCreateCell(this,newTd,'HDR_NAV_TOP_BOTTOM');
		return newTd;
	},
	appendNavTdLeftRight: function(trElem, text, options){
		newTd = this.appendNavTd(trElem, text, options);
		newTd.addClassName('navTdLeftRight');
		if(this.userGridCtrl) this.userGridCtrl.onCreateCell(this,newTd,'HDR_NAV_LEFT_RIGHT');
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
			this.userGridCtrl.onUpdateCellState(this, elemTd,cellState);
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
			}else if(this.isGridHdrValueCell(tdElem)) {
				this.highlight(tdElem,'gridHdrValueTdHover');
			}else if(this.isNavCell(tdElem)) {
				//this.highlight(tdElem,'navTdHover');
			}
		}
		
	},
	onMouseClick: function(event){
		var tdElem = event.findElement('td');
		if(tdElem){
			if(this.isGridValueCell(tdElem)) {
				this.toggleCheckState(tdElem);
			}else if(this.isGridHdrValueCell(tdElem)) {
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
	isGridHdrValueCell: function(tdElem) {
		return tdElem && tdElem.hasClassName('gridHdrValueTd');
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
			// fire selection change
			if(this.userGridCtrl) {
				this.userGridCtrl.onSelectionChange(this,elemTd,cellState);				
			}
		}
	},
	toggleCheckStateList: function(elemTd){
		console.log('implement WGrid.toggleCheckStateList()');
		// TODO
	},
	toggleHdrCollapseState: function(list, key){
		list.each(
			function(elm){
				if(elm.type == 'LIST' && elm.key == key){					
					elm.collapsed = !elm.collapsed;
				}
			}
		);
	},
	toggleCollapseState: function(elemTd){
		if(elemTd.id.startsWith('C')){ // column
			if(this.transpose) this.toggleHdrCollapseState(this.data.rows,elemTd.id.substring(2));
			else this.toggleHdrCollapseState(this.data.cols,elemTd.id.substring(2));
		}else if(elemTd.id.startsWith('R')){ // row
			if(this.transpose) this.toggleHdrCollapseState(this.data.cols,elemTd.id.substring(2));
			else this.toggleHdrCollapseState(this.data.rows,elemTd.id.substring(2));
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
	getCellsListCount: function(list){
		count = 0;
		list.each(
			function(elm){
				if(elm.type == 'LIST'){
					count++;
				}
			});
		return count;
	},
	getCellsOrphanCount: function(list){
		count = 0;
		list.each(
			function(elm){
				if(elm.type == 'VALUE'){
					count++;
				}
			});
		return count;
	},
	getGridStats: function(list){
		cellsCount=0;
		cellsListCount = 0;
		cellsOrphanCount = 0;
		
		list.each(
			function(elm){
				if(elm.type == 'LIST'){
					cellsListCount++;
					if(elm.collapsed || !elm.elements || elm.elements.size() == 0){
						cellsCount++;
					}else{
						cellsCount += elm.elements.size();
					}
				}else if(elm.type == 'VALUE'){
					cellsCount++;
					cellsOrphanCount++;
				}
			});
			
		return {
				cells  : cellsCount,
				lists  : cellsListCount,
				orphans : cellsOrphanCount
		};
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
				
		displayedData = {colsTitle:data.colsTitle, rowsTitle:data.rowsTitle, cols:displayedCols , rows:displayedRows}
		return displayedData;
	},	

	// -------------------------------------------------------------------------------------
	// CELLS IDS
	// -------------------------------------------------------------------------------------
	
	transcodeGridHdrListColId: function(key){
		if(this.transpose) return 'RL'+key;
		return 'CL'+key;
	},
	transcodeGridHdrListRowId: function(key){
		if(this.transpose) return 'CL'+key;
		return 'RL'+key;
	},
	transcodeGridHdrColId: function(key){
		if(this.transpose) return 'RV'+key;
		return 'CV'+key;
	},
	transcodeGridHdrRowId: function(key){
		if(this.transpose) return 'CV'+key;
		return 'RV'+key;
	},
	transcodeId: function(prefix1, key1, prefix2, key2){
		if(this.transpose) {
			prefix1Trans = prefix1[0]+prefix2[1];
			prefix2Trans = prefix2[0]+prefix1[1];
			return prefix1Trans+key2+'_'+prefix2Trans+key1;
		}
		return prefix1+key1+'_'+prefix2+key2;
	},
	transcodeCLRL: function(key1, key2){
		return this.transcodeId('CL', key1, 'RL', key2);
	},
	transcodeCVRL: function(key1, key2){
		return this.transcodeId('CV', key1, 'RL', key2);
	},
	transcodeCLRV: function(key1, key2){
		return this.transcodeId('CL', key1, 'RV', key2);
	},
	transcodeCVRV: function(key1, key2){
		return this.transcodeId('CV', key1, 'RV', key2);
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
		originalList = this.options.data.cols;
		if(this.transpose) originalList = this.options.data.rows;
		filteredCols = this.getFilteredList(originalList,filter);		
		if(filteredCols){
			this.data.filterCols = filter;
			this.data.cols = filteredCols;
			this.colShift= 0;
			this.dispose();
		}
	},
	filterRows: function(filter){
		originalList = this.options.data.rows;
		if(this.transpose) originalList = this.options.data.cols;
		filteredRows = this.getFilteredList(originalList,filter);		
		if(filteredRows){
			this.data.filterRows = filter;
			this.data.rows = filteredRows;
			this.rowShift= 0;
			this.dispose();
		}
	},
	
	// -------------------------------------------------------------------------------------
	// TRANSPOSE
	// -------------------------------------------------------------------------------------
	toggleGridTranspose: function(){
		this.transpose = !this.transpose;
		
		tmpCols = this.data.cols;
		tmpRows = this.data.rows;
		tmpColsTitle = this.data.colsTitle;
		tmpRowsTitle = this.data.rowsTitle;		
		tmpFilterCols = this.data.filterCols;
		tmpFilterRows = this.data.filterRows;
		this.data = {colsTitle:tmpRowsTitle, rowsTitle:tmpColsTitle, cols:tmpRows, rows:tmpCols, filterCols:tmpFilterRows, filterRows:tmpFilterCols};
		
		tmpColShift = this.colShift;
		tmpRowShift = this.rowShift;
		this.colShift = tmpRowShift;
		this.rowShift = tmpColShift;
		
		if(this.userGridCtrl) {
			this.userGridCtrl.onGridTranspose(this);
		}
		
		this.dispose();
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
	// SHIFT CELLS MODE
	// -------------------------------------------------------------------------------------
	isNavigationAlwaysVisible: function(){
		return this.navigationAlwaysVisible;
	},
	isNavigationModeBar: function(){
		return this.navigationMode == 'BAR';
	},
	isNavigationModeScroll: function(){
		return this.navigationMode == 'SCROLL';
	},
	toggleNavigationMode: function(){
		if(this.navigationMode == 'SCROLL') 
			this.navigationMode = 'BAR';
		else
			this.navigationMode = 'SCROLL';			
			
		this.dispose();
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
	},	
	getStatistics: function(){
		displayedDataRange = this.getDisplayedDataRange(this.data);
		return {
				originalData:{
					'totalCols':this.getCellsCount(this.options.data.cols),
					'totalColsLists':this.getCellsListCount(this.options.data.cols),
					'totalColsOrphan':this.getCellsOrphanCount(this.options.data.cols),
					'totalRows':this.getCellsCount(this.options.data.rows),
					'totalRowsLists':this.getCellsListCount(this.options.data.rows),
					'totalRowsOrphan':this.getCellsOrphanCount(this.options.data.rows)
					},
				filteredData:{
					'totalCols':this.getCellsCount(this.data.cols),
					'totalColsLists':this.getCellsListCount(this.data.cols),
					'totalColsOrphan':this.getCellsOrphanCount(this.data.cols),
					'totalRows':this.getCellsCount(this.data.rows),
					'totalRowsLists':this.getCellsListCount(this.data.rows),
					'totalRowsOrphan':this.getCellsOrphanCount(this.data.rows)
					},					
				displayedData:{
					'totalCols':this.getCellsCount(displayedDataRange.cols),
					'totalColsLists':this.getCellsListCount(displayedDataRange.cols),
					'totalColsOrphan':this.getCellsOrphanCount(displayedDataRange.cols),
					'totalRows':this.getCellsCount(displayedDataRange.rows),
					'totalRowsLists':this.getCellsListCount(displayedDataRange.rows),
					'totalRowsOrphan':this.getCellsOrphanCount(displayedDataRange.rows)
					}
				}
	}
});
