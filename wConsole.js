var console = console || {
	log: function(text){
		if(!$('logBuffer')){
			logBuffer = new Element('div',{'id':'logBuffer','style' : 'position:fixed;bottom:0px;right:0px;width:100%;height:100px;overflow:scroll;border:1px solid gray;background-color:lightgreen;'});
			document.body.appendChild(logBuffer);
		}
		if(!$('logBufferList')){
			logBufferList = new Element('ul',{'id':'logBufferList','style':'padding:0px;margin:0px;font-size:small;'});
			$('logBuffer').appendChild(logBufferList);
		}
		logBufferList.innerHTML = logBufferList.innerHTML + '<li style="padding:0px;margin:0px;font-size:small;"><font style="color:silver">' + '['+(new Date()).toISOString()+'] '+ '</font>' + text + '</li>';
		$('logBuffer').scrollTop = $('logBuffer').scrollHeight;
	}
};
