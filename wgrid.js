var grid;

var WGrid = Class.create({
    initialize: function (container, options) {
        this.container = $(container);		
		this.colShift = 0;
		this.rowShift = 0;
		this.visibleColsCount = 10;
		this.visibleRowsCount = 10;
		this.defautShiftCellsCount = 1;
		this.highlightedElem = null;
		this.selectedValues = new Array();
		this.colsList = null;
		this.rowsList = null;
        this.options = options || {};
		this.init();		
		this.dispose();
    },
	init: function() {
		if(!this.options.cols || !this.options.cols.lists || !this.options.rows || !this.options.rows.lists) {
			console.log("missed data to be displayed !");
		}else {
			this.colsList = this.options.cols.lists;
			this.rowsList = this.options.rows.lists;
		}
	},
	
	// -------------------------------------------------------------------------------------
	// DRAW 
	// -------------------------------------------------------------------------------------

	dispose: function() {
		if(!this.colsList || !this.rowsList || this.colsList.size() == 0 || this.rowsList.size() == 0) {
			alert("no data to be displayed !");
		}else {
			if(this.options.grid) {
				if(this.options.grid.visibleColsCount) this.visibleColsCount = this.options.grid.visibleColsCount;
				if(this.options.grid.visibleRowsCount) this.visibleRowsCount = this.options.grid.visibleRowsCount;
			}			

			if(this.colsList.size() < this.visibleColsCount) this.visibleColsCount = this.colsList.size();
			if(this.rowsList.size() < this.visibleRowsCount) this.visibleRowsCount = this.rowsList.size();
			
			var startTime = new Date().getTime();  
			var elapsedTime = 0;  
			this.draw(0,0);
			elapsedTime = new Date().getTime() - startTime;  
			console.log('grid drawing takes ' + elapsedTime/1000 + 's no counting display time');  
		}
	},
	
	draw: function() {
		console.log('redraw');
		
		if(this.container.down()) {
			this.container.down().remove();
		}
		
		minColIndex = this.colShift;
		maxColIndex = this.colShift + this.visibleColsCount;

		minRowIndex = this.rowShift;
		maxRowIndex = this.rowShift + this.visibleRowsCount;
		
		var me = this;
	
		// create table Grid
		var gridTable = new Element('table');

		// compute colspan for navigation cell top and bottom
		colspan = this.visibleColsCount+1;
		if(this.colsList.size() - minColIndex < this.visibleColsCount) colspan = this.colsList.size() - minColIndex + 1;
		// compute rowsopan for navigation cell left and right
		rowspan = this.visibleRowsCount+1;
		if(this.rowsList.size() - minRowIndex < this.visibleRowsCount) rowspan = this.rowsList.size() - minRowIndex + 1;
		
		// cell navigation top
		var row = this.appendTr(gridTable);
		me.appendTd(row);
		shiftTopCell = me.appendNavTd(row,null,{'colspan' : colspan});
		me.appendTd(row);

		// cell navigation left
		var row = this.appendTr(gridTable);
		shiftLeftCell = me.appendNavTd(row,null,{'rowspan': rowspan});
		
		// create columns headers row
		me.appendTd(row);
		
		// append top headers
		colIndex = 0;
		this.colsList.each(
				function(elm){
					colIndex++;
					if(colIndex> minColIndex && colIndex<=maxColIndex){
						me.appendGridHdrTd(row,elm.value,{'id':'C'+elm.key});
					}
				}
			);
		
		// cell navigation right
		shiftRightCell = me.appendNavTd(row,null,{'rowspan': rowspan});

		// create rows headers and rows values
		rowIndex = 0;
		this.rowsList.each(
				function(elm){
					rowIndex++;
					if(rowIndex> minRowIndex && rowIndex<=maxRowIndex){
						var row = me.appendTr(gridTable);
						me.appendGridHdrTd(row,elm.value,{'id':'R'+elm.key});
						
						colIndex = 0;
						me.colsList.each(
								function(elm2){
									colIndex++;
									if(colIndex> minColIndex && colIndex<=maxColIndex){
										me.appendGridValueTd(row,null,{'id':'C'+elm2.key+'_R'+elm.key});
									}
								}
							);							
					}
				}
			);
		
		// cell navigation bottom
		var row = this.appendTr(gridTable);
		me.appendTd(row);
		shiftBottomCell = me.appendNavTd(row,null,{'colspan' : colspan});
		me.appendTd(row);

		// append top shifter to right
		if(this.canShiftTop()){
			link = new Element('a',{'href':'javascript:return;'});
			link.appendChild(document.createTextNode("TOP"));
			shiftTopCell.appendChild(link);
			shiftTopCell.observe('click',this.shiftTop.bind(this));
		}else{
			shiftTopCell.appendChild(document.createTextNode("TOP"));			
		}
		// append top shifter to left
		if(this.canShiftLeft()){
			link = new Element('a',{'href':'javascript:return;'});
			link.appendChild(document.createTextNode("LEFT"));
			shiftLeftCell.appendChild(link);
			shiftLeftCell.observe('click',this.shiftLeft.bind(this));
		}else{
			shiftLeftCell.appendChild(document.createTextNode("LEFT"));			
		}
		// append top shifter to right
		if(this.canShiftRight()){
			link = new Element('a',{'href':'javascript:return;'});
			link.appendChild(document.createTextNode("RIGHT"));
			shiftRightCell.appendChild(link);
			shiftRightCell.observe('click',this.shiftRight.bind(this));
		}else{
			shiftRightCell.appendChild(document.createTextNode("RIGHT"));			
		}
		// append top shifter to right
		if(this.canShiftBottom()){
			link = new Element('a',{'href':'javascript:return;'});
			link.appendChild(document.createTextNode("BOTTOM"));
			shiftBottomCell.appendChild(link);
			shiftBottomCell.observe('click',this.shiftBottom.bind(this));
		}else{
			shiftBottomCell.appendChild(document.createTextNode("BOTTOM"));
		}

		this.container.appendChild(gridTable);
		// set styles
		gridTable.addClassName('gridTable');
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
	appendGridHdrTd: function(trElem, text, options){
		newTd = this.appendTd(trElem, null, options);
		if(text){
			div = new Element('div');
			div.appendChild(document.createTextNode(text));
			newTd.appendChild(div);		
		}
		newTd.addClassName('gridHdrTd');
		return newTd;
	},
	appendGridValueTd: function(trElem, text, options){
		newTd = this.appendTd(trElem, text, options);
		newTd.addClassName('gridValueTd');
		if(this.isSelectedGridValueCell(newTd)){this.setSelectedGridValueCell(newTd);}
		if(newTd.id) newTd.appendChild(document.createTextNode(newTd.id))
		return newTd;
	},
	appendNavTd: function(trElem, text, options){
		newTd = this.appendTd(trElem, text, options);
		newTd.addClassName('navTd');
		return newTd;
	},
	
	// -------------------------------------------------------------------------------------
	// MOUSE EVENTS
	// -------------------------------------------------------------------------------------
	
	onMouseMove: function(event){
		var tdElem = event.findElement('td');
		if(tdElem){
			if(this.isGridValueCell(tdElem)) {
				this.highlight(tdElem,'gridValueTdHover');
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
				this.toggle(tdElem);
			}
		}
		
	},
	onMouseOut: function(event){
		this.highlight(null);
	},
	highlight: function(elem, cssClass){
		if(this.highlightedElem) this.highlightedElem.removeClassName('*Hover');
		this.highlightedElem=null;
		if(elem && !this.isSelectedGridValueCell(elem)){			
			this.highlightedElem = elem;
			this.highlightedElem.addClassName(cssClass);
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
	isGridHdrCell: function(tdElem) {
		return tdElem && tdElem.hasClassName('gridHdrTd');
	},
	isSelectedGridValueCell: function(elemTd) {
		return this.selectedValues.indexOf(elemTd.id) != -1;
	},
	setSelectedGridValueCell: function(elemTd) {
		if(this.selectedValues.indexOf(elemTd.id) == -1) this.selectedValues.push(elemTd.id);
		elemTd.addClassName('gridValueCellSelected');
	},
	setUnSelectedGridValueCell: function(elemTd) {
		this.selectedValues.pop(elemTd.id);
		elemTd.removeClassName('gridValueCellSelected');
	},
	toggle: function(elemTd){
		if(this.isSelectedGridValueCell(elemTd)){
			// not yet selected
			this.setUnSelectedGridValueCell(elemTd);
		}else{
			// already selected
			this.setSelectedGridValueCell(elemTd);
		}
	},	
	
	// -------------------------------------------------------------------------------------
	// GRID FILTER
	// -------------------------------------------------------------------------------------
	
	filterCols: function(filter){
		if(this.options && this.options.cols && this.options.cols.lists){ 
			filteredList = this.options.cols.lists.findAll(
					function(elm){
						if(elm) return elm.value.match(filter);
						return false;
					});
			if(!filteredList || filteredList.size() == 0){
				alert("no result match the filter");
			}else{
				this.colsList = filteredList;
				this.dispose();
			}
		}
	},
	filterRows: function(filter){
		if(this.options && this.options.rows && this.options.rows.lists){
			filteredList = this.options.rows.lists.findAll(
					function(elm){
						if(elm) return elm.value.match(filter);
						return false;
					});		
			if(!filteredList || filteredList.size() == 0){
				alert("no result match the filter");
			}else{
				this.rowsList = filteredList;
				this.dispose();
			}
		}
	},
	
	// -------------------------------------------------------------------------------------
	// SHIFT CELLS
	// -------------------------------------------------------------------------------------
	
	shiftTopCells: function(cellsToShift) {
		if(this.canShiftTop()) {
			this.rowShift = this.rowShift - cellsToShift;
			this.draw();
		}
	},	
	shiftBottomCells: function(cellsToShift) {
		if(this.canShiftBottom()) {
			this.rowShift = this.rowShift + cellsToShift;
			this.draw();
		}
	},
	shiftLeftCells: function(cellsToShift) {		
		if(this.canShiftLeft()) {
			this.colShift = this.colShift - cellsToShift;
			this.draw();
		}
	},
	shiftRightCells: function(cellsToShift) {
		if(this.canShiftRight()) {
			this.colShift = this.colShift + cellsToShift;
			this.draw();
		}
	},

	// -------------------------------------------------------------------------------------
	// SHIFT CELLS DEFAULT
	// -------------------------------------------------------------------------------------
	
	shiftTop: function() {
		//this.shiftTopCells(this.visibleRowsCount);
		this.shiftTopCells(this.defautShiftCellsCount);
	},
	shiftBottom: function() {
		//this.shiftBottomCells(this.visibleRowsCount);
		this.shiftBottomCells(this.defautShiftCellsCount);
	},
	shiftLeft: function() {
		//this.shiftLeftCells(this.visibleColsCount);
		this.shiftLeftCells(this.defautShiftCellsCount);
	},
	shiftRight: function() {
		//this.shiftRightCells(this.visibleColsCount);
		this.shiftRightCells(this.defautShiftCellsCount);
	},
	
	// -------------------------------------------------------------------------------------
	// CAN SHIFT
	// -------------------------------------------------------------------------------------
	
	canShiftLeft: function() { 
		return this.colShift > 0; 
	},
	canShiftRight: function() { 
		return this.colsList.size() - this.colShift > this.visibleColsCount; 
	},
	canShiftTop: function() { 
		return this.rowShift > 0; 
	},
	canShiftBottom: function() { 
		return this.rowsList.size() - this.rowShift > this.visibleRowsCount; 
	}

});