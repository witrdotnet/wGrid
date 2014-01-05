function getRandomName(){
	return getFixedLengthRandomName(20);
}

function getFixedLengthRandomName(charsCount){
	return getVariableLengthRandomName(charsCount,charsCount);
}

function getVariableLengthRandomName(minChars, maxChars){
	name = '';
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


	minColsListsCount = 0;
	maxColsListsCount = 5;

	minRowsListsCount = 0;
	maxRowsListsCount = 5;

	minValuesInLists = 3;
	maxValuesInLists = 10;

	minColsValuesCount = 0;
	maxColsValuesCount = 20;

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
			setTimeout("startDemo(1,{'valId':"+valId+"});",pauseTime);
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
		setTimeout("startDemo(2,{'valId':0,'listId':0});",pauseTime);
	}

	if(phase == 2){	
		// append rows lists	
		listId = options.listId;		
		listId++;
		valId = options.valId;
		if(listId <= rowsListsCount){
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
		// define customized user grid ctrl
		var GinUserCtrl = Class.create({	
			onCreateCell: function(gridObject, elemTd,cellState){
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
			}
		});
		var ginUserCtrl = new GinUserCtrl;

		// create Grid with customized gridCtrl
		grid = new WGrid('cont',{
								userGridCtrl : ginUserCtrl,
								data : {cols:colsList, rows:rowsList},
								disabledValues: disabledValuesList,
								alreadySelectedValues: alreadySelectedValuesList,
								grid:{visibleColsCount:visibleCols,visibleRowsCount:visibleRows}
								}
							);
		evtText = false;
		Event.observe($('filterColsText'), 'keyup', function(event){ 				
			grid.filterCols(event.target.value);
			evtText = true;				
		});
		Event.observe($('filterRowsText'), 'keyup', function(event){ 				
			grid.filterRows(event.target.value);
			evtText = true;				
		});			
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
		
		// print stats of generated data
		stats = grid.getStatistics();
		$('generatedData').innerHTML =	"<table>" +										
										"<tr><td>GRID</td><td>" + stats.originalData.totalCols + " x " + stats.originalData.totalRows + "</td><td>columns[lists:"+stats.originalData.totalColsLists+" , orphans:"+stats.originalData.totalColsOrphan+"]</td><td>rows[lists:"+stats.originalData.totalRowsLists+" , orphans:"+stats.originalData.totalRowsOrphan+"]</td></tr>" +
										//"<tr><td>FILTERED</td><td>" + stats.filteredData.totalCols + " x " + stats.filteredData.totalRows + "</td><td>columns[lists:"+stats.filteredData.totalColsLists+" , orphans:"+stats.filteredData.totalColsOrphan+"]</td><td>rows[lists:"+stats.filteredData.totalRowsLists+" , orphans:"+stats.filteredData.totalRowsOrphan+"]</td></tr>" +
										//"<tr><td>DISPLAYED</td><td>" + stats.displayedData.totalCols + " x " + stats.displayedData.totalRows + "</td><td>columns[lists:"+stats.displayedData.totalColsLists+" , orphans:"+stats.displayedData.totalColsOrphan+"]</td><td>rows[lists:"+stats.displayedData.totalRowsLists+" , orphans:"+stats.displayedData.totalRowsOrphan+"]</td></tr>" +
										"</table>";
			/*
				"<br/> columns lists = " + stats.totalColsLists +
				"<br/> orphan columns = " + stats.totalColsOrphan +
				"<br/> rows lists = " + stats.totalRowsLists +
				"<br/> orphan rows = " + stats.totalRowsOrphan;
			*/
	}
}