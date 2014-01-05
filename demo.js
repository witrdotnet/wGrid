function getRandomName(){
	return getFixedLengthRandomName(4) + ' ' + getFixedLengthRandomName(4);
}

function getFixedLengthRandomName(charsCount){
	return getVariableLengthRandomName(charsCount,charsCount);
}

function getVariableLengthRandomName(minChars, maxChars){
	name = '';//'l\'';
	charsCount = getRandomInt(minChars, maxChars);
	for(j=0; j<charsCount; j++){
		var randomnumber=Math.floor(Math.random()*25)+65
		name = name + String.fromCharCode(randomnumber);
	}
	return name;
}

function getRandomInt(min,max){
	return Math.floor(Math.random()*(max-min))+min;
}

// define customized user grid ctrl
var GinUserCtrl = Class.create({	
	initialize: function () {
		this.filterColsText = null;
		this.filterRowsText = null;
	},	
	displaySearchColsInput: function(){
		ginUserCtrl.filterColsText = '';
		// hide search rows
		if($('searchActionButtonRows')) $('searchActionButtonRows').show();
		if($('filterRowsBlock')) $('filterRowsBlock').hide();
		// show search cols
		$('searchActionButtonCols').hide();
		$('filterColsBlock').show();
		$('filterColsText').focus();
	},
	displaySearchRowsInput: function(){
		ginUserCtrl.filterRowsText = '';
		// hide search rows
		if($('searchActionButtonCols')) $('searchActionButtonCols').show();
		if($('filterColsBlock')) $('filterColsBlock').hide();
		// show search cols
		$('searchActionButtonRows').hide();
		$('filterRowsBlock').show();
		$('filterRowsText').focus();
	},
	onCreateCell: function(gridObject,elemTd,cellType){
		switch(cellType){
			case 'HDR_TITLE_HORIZONTAL': 
				if(gridObject.data.filterCols && gridObject.data.filterCols.trim().length > 0){
					divFilterText = new Element('div',{'style':'margin-left:10px;float:left'});
					divFilterText.innerHTML = "( "+ gridObject.data.filterCols;
					buttonClearFilter = new Element('img',{'class':'clearFilterButton','onclick':'grid.filterCols(\'\')'});

					divFilterText2 = new Element('div',{'style':'float:left'});
					divFilterText2.innerHTML = " )";
					
					elemTd.appendChild(divFilterText);
					elemTd.appendChild(buttonClearFilter);
					elemTd.appendChild(divFilterText2);
				}else{
					searchActionButton = new Element('div',{'id':'searchActionButtonCols','class':'filterButton','onclick':'ginUserCtrl.displaySearchColsInput($(this));'});
					inputFilterText = new Element('input',{'type':'text','id':'filterColsText','style':'margin-left:10px;float:left'});
					buttonSubmitFilter = new Element('img',{'class':'filterButton','onclick':'grid.filterCols($(\'filterColsText\').value)'});
					filterColsBlock = new Element('div',{'id':'filterColsBlock','style':'display:none;height:30px;'});
					filterColsBlock.appendChild(inputFilterText);
					filterColsBlock.appendChild(buttonSubmitFilter);
					elemTd.appendChild(searchActionButton);
					elemTd.appendChild(filterColsBlock);
				}					
				break;
			case 'HDR_TITLE_VERTICAL': 					
				if(gridObject.data.filterRows && gridObject.data.filterRows.trim().length > 0){
					divFilterText = new Element('div',{'style':'margin-left:10px;float:left'});
					divFilterText.innerHTML = "( "+ gridObject.data.filterRows;
					buttonClearFilter = new Element('img',{'class':'clearFilterButton','onclick':'grid.filterRows(\'\')'});

					divFilterText2 = new Element('div',{'style':'float:left'});
					divFilterText2.innerHTML = " )";
					
					elemTd.appendChild(divFilterText);
					elemTd.appendChild(buttonClearFilter);
					elemTd.appendChild(divFilterText2);
				}else{
					searchActionButton = new Element('div',{'id':'searchActionButtonRows','class':'filterButton','onclick':'ginUserCtrl.displaySearchRowsInput($(this));'});
					inputFilterText = new Element('input',{'type':'text','id':'filterRowsText','style':'margin-left:10px;float:left'});
					buttonSubmitFilter = new Element('img',{'class':'filterButton','onclick':'grid.filterRows($(\'filterRowsText\').value)'});
					filterRowsBlock = new Element('div',{'id':'filterRowsBlock','style':'display:none;height:30px;'});						
					filterRowsBlock.appendChild(inputFilterText);
					filterRowsBlock.appendChild(buttonSubmitFilter);
					elemTd.appendChild(searchActionButton);
					elemTd.appendChild(new Element('br'));
					elemTd.appendChild(filterRowsBlock);
				}					
				break;
		}
	},
	onDrawComplete: function(gridObject){	
	},
	onUpdateCellState: function(gridObject, elemTd,cellState){
		person = null;
		if(!cellState.enabled){
			disabledValuesList.each(
				function(disVal){								
					if(disVal.alreadyDelegatedTo){
						if('CV'+disVal.colId + '_RV' + disVal.rowId == elemTd.id){
							person = disVal.alreadyDelegatedTo;
							throw $break;
						}
					}
				}
			);
			if(person){
				elemTd.innerHTML = '';
				if(!elemTd.hasClassName('cell-dis')) elemTd.addClassName('cell-dis');
				elemTd.removeClassName('gridValueCellDisabled');
				elemTd.innerHTML = person;						
			}
		}
	},
	onSelectionChange: function(gridObject,elemTd,cellState){
		console.log(gridObject.selectedValues);
		$('serializedSelected').value = gridObject.selectedValues;
	},
	onCreateCrossCell: function(gridObject,elemTd){
		elemTd.innerHTML = "<a href='javascript:grid.toggleGridTranspose();' style='font-size:15px;font-weight:bold;'>TRANS</a>";
	},
	onGridTranspose : function(gridObject){
		tmpFilterCols = this.filterColsText;
		tmpFilterRows = this.filterRowsText;
		
		this.filterColsText = tmpFilterRows;
		this.filterRowsText = tmpFilterCols;
	}
});

	eventsListenersAlreadyBound = false;
	ginUserCtrl = null;

	colsTitle = getRandomName();
	rowsTitle = getRandomName();

	minColsListsCount = 2;
	maxColsListsCount = 2;

	minRowsListsCount = 0;
	maxRowsListsCount = 5;

	minValuesInLists = 3;
	maxValuesInLists = 3;

	minColsValuesCount = 3;
	maxColsValuesCount = 3;

	minRowsValuesCount = 0;
	maxRowsValuesCount = 20;

	disValuesCount = 30;
	alreadySelectedValuesCount = 30;

	visibleCols = 8;
	visibleRows = 15;
	
	rowsListsCount = getRandomInt(minRowsListsCount, maxRowsListsCount);
	colsListsCount = getRandomInt(minColsListsCount, maxColsListsCount);
	maxColId = 0;
	maxRowId = 0;

	callCount = 0;
	pauseTime = 1;

	var colsList = new Array();
	var rowsList = new Array();
	var disabledValuesList = new Array();
	var alreadySelectedValuesList = new Array();


function startDemo(phase,options){
	if($('cont').down()) $('cont').down().remove();
	$('cont').innerHTML = "<div class='progress'>generating data : " + (callCount++) + "</div>";
		
	if(phase == 0){	
		// append cols lists
		listId = options.listId;		
		listId++;
		valId = options.valId;
		if(listId <= colsListsCount){
			valuesList2 = new Array();
			valuesListCount = getRandomInt(minValuesInLists,maxValuesInLists);				
			for(v =1; v<=valuesListCount;v++) {
				valId++;
				valueName = getRandomName();
				valuesList2.push({type:'VALUE', key:valId, name:valueName +"("+valId+")"});					
			}			
			listName = getRandomName() + "("+listId+")";
			colsList.push({type:'LIST', key:listId, name:listName, elements : valuesList2, collapsed:false});			
			setTimeout("startDemo(0,{'valId':"+valId+",'listId':"+listId+"});",pauseTime);
		}else{
			setTimeout("startDemo(1,{'valId':"+valId+",'listId':"+(listId-1)+"});",pauseTime);
		}
		
	}

	if(phase == 1){	
		valId = options.valId;
		// append cols values(without lists)
		colsValuesCount = getRandomInt(minColsValuesCount, maxColsValuesCount);
		for(v =1; v<=colsValuesCount;v++) {
			valId++;
			valueName = getRandomName();
			colsList.push({type:'VALUE', key:valId, name:valueName +"("+valId+")"});					
		}			
		
		// memorize max col id 
		maxColId = valId;
		setTimeout("startDemo(2,{'valId':0,'listId':"+options.listId+"});",pauseTime);
	}

	if(phase == 2){	
		// append rows lists	
		listId = options.listId;		
		listId++;
		valId = options.valId;
		if(listId <= colsListsCount + rowsListsCount){
			valuesList2 = new Array();
			valuesListCount = getRandomInt(minValuesInLists,maxValuesInLists);				
			for(v =1; v<=valuesListCount;v++) {
				valId++;
				valueName = getRandomName();
				valuesList2.push({type:'VALUE', key:valId, name:valueName +"("+valId+")"});					
			}			
			listName = getRandomName() + "("+listId+")";
			rowsList.push({type:'LIST', key:listId, name:listName, elements : valuesList2, collapsed:false});			
			setTimeout("startDemo(2,{'valId':"+valId+",'listId':"+listId+"});",pauseTime);
		}else{
			setTimeout("startDemo(3,{'valId':"+valId+"});",pauseTime);
		}
	}

	if(phase == 3){	
		valId = options.valId;
		// append rows values(without lists)
		rowsValuesCount = getRandomInt(minRowsValuesCount,maxRowsValuesCount);
		for(v =1; v<=rowsValuesCount;v++) {
			valId++;
			valueName = getRandomName();
			rowsList.push({type:'VALUE', key:valId, name:valueName +"("+valId+")"});					
		}			

		// memorize max row id 
		maxRowId = valId;
		setTimeout("startDemo(4);",pauseTime);
	}
	
	if(phase == 4){
		// disabled values			
		for(d=1; d<=disValuesCount;d++){
			disColId = getRandomInt(1,maxColId+1);
			disRowId = getRandomInt(1,maxRowId+1);
			personHavingFrag = null;
			if(getRandomInt(1,10) > 5) personHavingFrag = getVariableLengthRandomName(5,10) + ' ' + getVariableLengthRandomName(5,10);
			disabledValuesList.push({colId : disColId, rowId : disRowId, alreadyDelegatedTo : personHavingFrag});
		}
		setTimeout("startDemo(5);",pauseTime);
	}

	if(phase == 5){
		// already selected values			
		for(d=1; d<=alreadySelectedValuesCount;d++){
			selColId = getRandomInt(1,maxColId+1);
			selRowId = getRandomInt(1,maxRowId+1);
			disabled = false;
			disabledValuesList.each(
				function(disVal){
					if(disVal.colId == selColId && disVal.rowId == selRowId){
						disabled = true;
						throw $break;
					}
				}
			);
			if(!disabled) alreadySelectedValuesList.push({colId : selColId, rowId : selRowId});
		}
		setTimeout("startDemo(6);",pauseTime);
	}
	
	if(phase == 6){

		disabledValues = new Array();
		disabledValuesList.each(
			function(value){
				if(value.colId) id = 'CV'+value.colId;
				if(value.rowId) {
					if(id && id.length>0) id = id + '_';
					id = id + 'RV'+value.rowId;
				}
				if(id) disabledValues.push(id);
			}
		);

		alreadySelectedValues = new Array();
		alreadySelectedValuesList.each(
			function(value){
				if(value.colId) id = 'CV'+value.colId;
				if(value.rowId) {
					if(id && id.length>0) id = id + '_';
					id = id + 'RV'+value.rowId;
				}
				if(id) alreadySelectedValues.push(id);
			}
		);

		// create Grid with customized gridCtrl
		grid = new WGrid('cont',{
								userGridCtrl : ginUserCtrl,
								data : {cols:colsList, rows:rowsList, colsTitle : colsTitle, rowsTitle : rowsTitle},
								disabledValues: disabledValues,
								alreadySelectedValues: alreadySelectedValues,
								parameters:{visibleColsCount:visibleCols,visibleRowsCount:visibleRows}
								}
							);
		// init selected values input text
		$('serializedSelected').value = grid.selectedValues;
		// add keys listeners
		evtText = false;
		if(!eventsListenersAlreadyBound){
			Event.observe($('filterColsText'), 'keyup', function(event){ 				
				grid.filterCols(event.target.value);
				evtText = true;				
			});
			Event.observe($('filterRowsText'), 'keyup', function(event){ 				
				grid.filterRows(event.target.value);
				evtText = true;				
			});			
			// add clear filter actions
			Event.observe($('clearFilterCols'), 'click', function(event){
				$('filterColsText').value=null;
				grid.filterCols('');
				event.stop();
			});
			Event.observe($('clearFilterRows'), 'click', function(event){
				$('filterRowsText').value=null;
				grid.filterRows('');
				event.stop();
			});
			Event.observe(document, 'keydown', function(event){ 				
				if(!evtText){
					if(event.keyCode == Event.KEY_RIGHT) { grid.shiftRight(); event.stop(); }
					if(event.keyCode == Event.KEY_LEFT) { grid.shiftLeft(); event.stop(); }
					if(event.keyCode == Event.KEY_UP) { grid.shiftTop(); event.stop(); }
					if(event.keyCode == Event.KEY_DOWN) { grid.shiftBottom(); event.stop(); }
				}else{
					evtText = false;
				}
			});
			eventsListenersAlreadyBound = true;
		}
		
		// print stats of generated data
		stats = grid.getStatistics();
		$('generatedData').innerHTML =	"GRID " + stats.originalData.totalCols + " x " + stats.originalData.totalRows;
	}
}

/********************************************************************************
****** DEMO 1
*********************************************************************************/

function startDemo1(){

	$('demoTitle').innerHTML = "DEMO 1";

	colsTitle = '';
	rowsTitle = '';
	
	minColsListsCount = 0;
	maxColsListsCount = 0;

	minRowsListsCount = 0;
	maxRowsListsCount = 0;

	minValuesInLists = 0;
	maxValuesInLists = 0;

	minColsValuesCount = 7;
	maxColsValuesCount = 7;

	minRowsValuesCount = 0;
	maxRowsValuesCount = 0;

	disValuesCount = 0;
	alreadySelectedValuesCount = 0;

	visibleCols = 7;
	visibleRows = 7;
	
	rowsListsCount = getRandomInt(minRowsListsCount, maxRowsListsCount);
	colsListsCount = getRandomInt(minColsListsCount, maxColsListsCount);
	maxColId = 0;
	maxRowId = 0;

	callCount = 0;
	pauseTime = 1;

	colsList = new Array();
	rowsList = new Array();
	disabledValuesList = new Array();
	alreadySelectedValuesList = new Array();

	ginUserCtrl = null;
	
	startDemo(0,{'valId':0,'listId':0});
}

/********************************************************************************
****** DEMO 2
*********************************************************************************/

function startDemo2(){

	$('demoTitle').innerHTML = "DEMO 2";

	colsTitle = '';
	rowsTitle = '';
	
	minColsListsCount = 0;
	maxColsListsCount = 0;

	minRowsListsCount = 0;
	maxRowsListsCount = 0;

	minValuesInLists = 0;
	maxValuesInLists = 0;

	minColsValuesCount = 0;
	maxColsValuesCount = 0;

	minRowsValuesCount = 7;
	maxRowsValuesCount = 7;

	disValuesCount = 0;
	alreadySelectedValuesCount = 0;

	visibleCols = 7;
	visibleRows = 7;
	
	rowsListsCount = getRandomInt(minRowsListsCount, maxRowsListsCount);
	colsListsCount = getRandomInt(minColsListsCount, maxColsListsCount);
	maxColId = 0;
	maxRowId = 0;

	callCount = 0;
	pauseTime = 1;

	colsList = new Array();
	rowsList = new Array();
	disabledValuesList = new Array();
	alreadySelectedValuesList = new Array();
	
	ginUserCtrl = null;

	startDemo(0,{'valId':0,'listId':0});
}	

/********************************************************************************
****** DEMO 3
*********************************************************************************/

function startDemo3(){

	$('demoTitle').innerHTML = "DEMO 3";

	colsTitle = '';
	rowsTitle = '';
	
	minColsListsCount = 0;
	maxColsListsCount = 0;

	minRowsListsCount = 0;
	maxRowsListsCount = 0;

	minValuesInLists = 0;
	maxValuesInLists = 0;

	minColsValuesCount = 7;
	maxColsValuesCount = 7;

	minRowsValuesCount = 7;
	maxRowsValuesCount = 7;

	disValuesCount = 0;
	alreadySelectedValuesCount = 0;

	visibleCols = 7;
	visibleRows = 7;
	
	rowsListsCount = getRandomInt(minRowsListsCount, maxRowsListsCount);
	colsListsCount = getRandomInt(minColsListsCount, maxColsListsCount);
	maxColId = 0;
	maxRowId = 0;

	callCount = 0;
	pauseTime = 1;

	colsList = new Array();
	rowsList = new Array();
	disabledValuesList = new Array();
	alreadySelectedValuesList = new Array();
	
	ginUserCtrl = null;

	startDemo(0,{'valId':0,'listId':0});
}	

/********************************************************************************
****** DEMO 4
*********************************************************************************/

function startDemo4(){

	$('demoTitle').innerHTML = "DEMO 4";

	colsTitle = '';
	rowsTitle = '';
	
	minColsListsCount = 2;
	maxColsListsCount = 2;

	minRowsListsCount = 2;
	maxRowsListsCount = 2;

	minValuesInLists = 3;
	maxValuesInLists = 3;

	minColsValuesCount = 1;
	maxColsValuesCount = 1;

	minRowsValuesCount = 1;
	maxRowsValuesCount = 1;

	disValuesCount = 0;
	alreadySelectedValuesCount = 0;

	visibleCols = 7;
	visibleRows = 7;
	
	rowsListsCount = getRandomInt(minRowsListsCount, maxRowsListsCount);
	colsListsCount = getRandomInt(minColsListsCount, maxColsListsCount);
	maxColId = 0;
	maxRowId = 0;

	callCount = 0;
	pauseTime = 1;

	colsList = new Array();
	rowsList = new Array();
	disabledValuesList = new Array();
	alreadySelectedValuesList = new Array();

	ginUserCtrl = null;

	startDemo(0,{'valId':0,'listId':0});
}	

/********************************************************************************
****** DEMO 5
*********************************************************************************/

function startDemo5(){

	$('demoTitle').innerHTML = "DEMO 5";

	colsTitle = getRandomName();
	rowsTitle = getRandomName();
	
	minColsListsCount = 2;
	maxColsListsCount = 2;

	minRowsListsCount = 2;
	maxRowsListsCount = 2;

	minValuesInLists = 3;
	maxValuesInLists = 3;

	minColsValuesCount = 1;
	maxColsValuesCount = 1;

	minRowsValuesCount = 1;
	maxRowsValuesCount = 1;

	disValuesCount = 0;
	alreadySelectedValuesCount = 0;

	visibleCols = 7;
	visibleRows = 7;
	
	rowsListsCount = getRandomInt(minRowsListsCount, maxRowsListsCount);
	colsListsCount = getRandomInt(minColsListsCount, maxColsListsCount);
	maxColId = 0;
	maxRowId = 0;

	callCount = 0;
	pauseTime = 1;

	colsList = new Array();
	rowsList = new Array();
	disabledValuesList = new Array();
	alreadySelectedValuesList = new Array();

	ginUserCtrl = null;

	startDemo(0,{'valId':0,'listId':0});
}	

/********************************************************************************
****** DEMO 6
*********************************************************************************/

function startDemo6(){

	$('demoTitle').innerHTML = "DEMO 6";

	colsTitle = getRandomName();
	rowsTitle = getRandomName();
	
	minColsListsCount = 3;
	maxColsListsCount = 3;

	minRowsListsCount = 3;
	maxRowsListsCount = 3;

	minValuesInLists = 3;
	maxValuesInLists = 3;

	minColsValuesCount = 7;
	maxColsValuesCount = 7;

	minRowsValuesCount = 7;
	maxRowsValuesCount = 7;

	disValuesCount = 0;
	alreadySelectedValuesCount = 0;

	visibleCols = 6;
	visibleRows = 6;
	
	rowsListsCount = getRandomInt(minRowsListsCount, maxRowsListsCount);
	colsListsCount = getRandomInt(minColsListsCount, maxColsListsCount);
	maxColId = 0;
	maxRowId = 0;

	callCount = 0;
	pauseTime = 1;

	colsList = new Array();
	rowsList = new Array();
	disabledValuesList = new Array();
	alreadySelectedValuesList = new Array();

	ginUserCtrl = null;

	startDemo(0,{'valId':0,'listId':0});
}	

/********************************************************************************
****** DEMO 7
*********************************************************************************/

function startDemo7(){

	$('demoTitle').innerHTML = "DEMO 7";

	colsTitle = getRandomName();
	rowsTitle = getRandomName();
	
	minColsListsCount = 3;
	maxColsListsCount = 3;

	minRowsListsCount = 3;
	maxRowsListsCount = 3;

	minValuesInLists = 3;
	maxValuesInLists = 3;

	minColsValuesCount = 7;
	maxColsValuesCount = 7;

	minRowsValuesCount = 7;
	maxRowsValuesCount = 7;

	disValuesCount = 0;
	alreadySelectedValuesCount = 200;

	visibleCols = 6;
	visibleRows = 6;
	
	rowsListsCount = getRandomInt(minRowsListsCount, maxRowsListsCount);
	colsListsCount = getRandomInt(minColsListsCount, maxColsListsCount);
	maxColId = 0;
	maxRowId = 0;

	callCount = 0;
	pauseTime = 1;

	colsList = new Array();
	rowsList = new Array();
	disabledValuesList = new Array();
	alreadySelectedValuesList = new Array();

	ginUserCtrl = null;

	startDemo(0,{'valId':0,'listId':0});
}	

/********************************************************************************
****** DEMO 8
*********************************************************************************/

function startDemo8(){

	$('demoTitle').innerHTML = "DEMO 8";

	colsTitle = getRandomName();
	rowsTitle = getRandomName();
	
	minColsListsCount = 3;
	maxColsListsCount = 3;

	minRowsListsCount = 3;
	maxRowsListsCount = 3;

	minValuesInLists = 3;
	maxValuesInLists = 3;

	minColsValuesCount = 7;
	maxColsValuesCount = 7;

	minRowsValuesCount = 7;
	maxRowsValuesCount = 7;

	disValuesCount = 200;
	alreadySelectedValuesCount = 0;

	visibleCols = 6;
	visibleRows = 6;
	
	rowsListsCount = getRandomInt(minRowsListsCount, maxRowsListsCount);
	colsListsCount = getRandomInt(minColsListsCount, maxColsListsCount);
	maxColId = 0;
	maxRowId = 0;

	callCount = 0;
	pauseTime = 1;

	colsList = new Array();
	rowsList = new Array();
	disabledValuesList = new Array();
	alreadySelectedValuesList = new Array();

	ginUserCtrl = null;

	startDemo(0,{'valId':0,'listId':0});
}	

/********************************************************************************
****** DEMO 9
*********************************************************************************/

function startDemo9(){

	$('demoTitle').innerHTML = "DEMO 9";

	colsTitle = getRandomName();
	rowsTitle = getRandomName();
	
	minColsListsCount = 3;
	maxColsListsCount = 3;

	minRowsListsCount = 3;
	maxRowsListsCount = 3;

	minValuesInLists = 3;
	maxValuesInLists = 3;

	minColsValuesCount = 7;
	maxColsValuesCount = 7;

	minRowsValuesCount = 7;
	maxRowsValuesCount = 7;

	disValuesCount = 200;
	alreadySelectedValuesCount = 0;

	visibleCols = 6;
	visibleRows = 6;
	
	rowsListsCount = getRandomInt(minRowsListsCount, maxRowsListsCount);
	colsListsCount = getRandomInt(minColsListsCount, maxColsListsCount);
	maxColId = 0;
	maxRowId = 0;

	callCount = 0;
	pauseTime = 1;

	colsList = new Array();
	rowsList = new Array();
	disabledValuesList = new Array();
	alreadySelectedValuesList = new Array();

	ginUserCtrl = new GinUserCtrl;
	
	startDemo(0,{'valId':0,'listId':0});	
}	

/********************************************************************************
****** DEMO 10
*********************************************************************************/

function startDemo10(){

	$('demoTitle').innerHTML = "DEMO 10";

	colsTitle = getRandomName();
	rowsTitle = getRandomName();
	
	minColsListsCount = 3;
	maxColsListsCount = 3;

	minRowsListsCount = 3;
	maxRowsListsCount = 3;

	minValuesInLists = 3;
	maxValuesInLists = 3;

	minColsValuesCount = 7;
	maxColsValuesCount = 7;

	minRowsValuesCount = 7;
	maxRowsValuesCount = 7;

	disValuesCount = 150;
	alreadySelectedValuesCount = 150;

	visibleCols = 6;
	visibleRows = 6;
	
	rowsListsCount = getRandomInt(minRowsListsCount, maxRowsListsCount);
	colsListsCount = getRandomInt(minColsListsCount, maxColsListsCount);
	maxColId = 0;
	maxRowId = 0;

	callCount = 0;
	pauseTime = 1;

	colsList = new Array();
	rowsList = new Array();
	disabledValuesList = new Array();
	alreadySelectedValuesList = new Array();
	
	ginUserCtrl = new GinUserCtrl;
	
	startDemo(0,{'valId':0,'listId':0});
}	

/********************************************************************************
****** DEMO 11
*********************************************************************************/

function startDemo11(){

	$('demoTitle').innerHTML = "DEMO 11";

	colsTitle = getRandomName();
	rowsTitle = getRandomName();
	
	minColsListsCount = 10;
	maxColsListsCount = 10;

	minRowsListsCount = 10;
	maxRowsListsCount = 10;

	minValuesInLists = 10;
	maxValuesInLists = 10;

	minColsValuesCount = 100;
	maxColsValuesCount = 100;

	minRowsValuesCount = 100;
	maxRowsValuesCount = 100;

	disValuesCount = 5000;
	alreadySelectedValuesCount = 5000;

	visibleCols = 6;
	visibleRows = 6;
	
	rowsListsCount = getRandomInt(minRowsListsCount, maxRowsListsCount);
	colsListsCount = getRandomInt(minColsListsCount, maxColsListsCount);
	maxColId = 0;
	maxRowId = 0;

	callCount = 0;
	pauseTime = 1;

	colsList = new Array();
	rowsList = new Array();
	disabledValuesList = new Array();
	alreadySelectedValuesList = new Array();
	
	ginUserCtrl = new GinUserCtrl;
	
	startDemo(0,{'valId':0,'listId':0});
}	
