/**
 * ------------------------------------------------------------
 * Copyright (c) 2019 Konstantin Bochkarev
 * ------------------------------------------------------------
 */

#target photoshop

//=============================================================================
// Images to template
//=============================================================================

var FILE_NAME = "template_for_cards.psd";
var FOLDER_NAME = "imgs";
var RESULT_FILE_NAME = "resultFile_";
var OUTPUT_DIRECTORY = "output";

app.bringToFront();
var startRulerUnits = app.preferences.rulerUnits;
var startTypeUnits = app.preferences.typeUnits;
var startDisplayDialogs = app.displayDialogs;

// Set Photoshop to use pixels and display no dialogs
app.displayDialogs = DialogModes.NO;
app.preferences.rulerUnits = Units.PIXELS;
app.preferences.typeUnits = TypeUnits.PIXELS;
main();


function main(){ 

	var curImg = 0;
	var counterTemplates = 1;

	var curDir = new File($.fileName).parent;

	var folderWithImages = Folder(curDir + "/" + FOLDER_NAME); 
	var images = folderWithImages.getFiles(/.[jpeg|jpg|png]$/i); 

	while (curImg < images.length) {

		var fileRef = File(curDir + "/" + FILE_NAME)
		app.open(fileRef);

		var doc = app.activeDocument;
		var layerRef = doc.layers;

		for (var i = 0; i < layerRef.length; i++) {
			if (curImg > images.length-1) {
				break;
			}

			var folderForSave = Folder(curDir + "/" + OUTPUT_DIRECTORY);
			if(!folderForSave.exists) folderForSave.create();

			var saveFile = File(curDir + "/" + OUTPUT_DIRECTORY + "/" + RESULT_FILE_NAME + counterTemplates + ".psd"); 

			var fileImgRef = images[curImg];  
			app.open(fileImgRef);  
			app.activeDocument.artLayers["Background"].copy();
			app.activeDocument.close();

		   var smartObjects = findLayers(doc, true, {  
		        typename: "ArtLayer",  
		        kind: LayerKind.SMARTOBJECT,  
		    });  

    if (smartObjects.length === 0)  
        return alert("Didn't find any Smart Layer");  

		var mySmartLayer = smartObjects[i];  

		touchLayer(mySmartLayer);  
		openSmartObject();  

		app.activeDocument.paste();

		var oldPref = app.preferences.rulerUnits    
		app.preferences.rulerUnits = Units.PIXELS;    
		var docT = app.activeDocument;   
		var iLayer = docT.activeLayer;    
		docT.activeLayer = iLayer;    
		var scale = Math.max(docT.width/(iLayer.bounds[2]-iLayer.bounds[0]),docT.height/(iLayer.bounds[3]-iLayer.bounds[1]));    
		iLayer.resize (scale*100,scale*100);    
		iLayer.translate(docT.width/2-(iLayer.bounds[0]+iLayer.bounds[2])/2,docT.height/2-(iLayer.bounds[1]+iLayer.bounds[3])/2);   

		moveLayerUpOrDown("Down");
		app.activeDocument.close(SaveOptions.SAVECHANGES); 
		curImg++;

		}

	//	alert(curImg);
		savePSD(saveFile); 
		counterTemplates++;
	}

	openResultFiles(counterTemplates, curDir + "/" + OUTPUT_DIRECTORY, RESULT_FILE_NAME);

}

	function openResultFiles(countOfFiles, directory, fileName){
		countOfTemplates = countOfFiles-1;
		for (var i = 1; i<=countOfTemplates; i++){
			var resultFile = File(directory + "/" + fileName + i + ".psd"); 
			app.open(resultFile);
		}
	}

	function savePSD(saveFile){
	  	var psdSaveOptions = new PhotoshopSaveOptions();
	    psdSaveOptions.embedColorProfile = true;
	    psdSaveOptions.alphaChannels = true;
	    psdSaveOptions.layers = true;
	    app.activeDocument.saveAs(saveFile, psdSaveOptions, true,
		Extension.LOWERCASE);
		app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
	} 

   function findLayers(searchFolder, recursion, userData, items) {  
        items = items || [];  
        var folderItem;  
        for (var i = 0, il = searchFolder.layers.length; i < il; i++) {  
            folderItem = searchFolder.layers[i];  
            if (propertiesMatch(folderItem, userData)) {  
                items.push(folderItem);  
            }  
            if (recursion === true && folderItem.typename === "LayerSet") {  
                findLayers(folderItem, recursion, userData, items);  
            }  
        }  
        return items;  
    }  

     function propertiesMatch(projectItem, userData) {  
        if (typeof userData === "undefined") return true;  
        for (var propertyName in userData) {  
            if (!userData.hasOwnProperty(propertyName)) continue;  
            if (!projectItem.hasOwnProperty(propertyName)) return false;  
            if (projectItem[propertyName].toString() !== userData[propertyName].toString()) {  
                return false;  
            }  
        }  
        return true;   
    } 
  
  
    function touchLayer(layer) {  
        app.activeDocument.activeLayer = layer;  
        var desc = new ActionDescriptor();  
        var ref = new ActionReference();  
        ref.putIdentifier(app.charIDToTypeID('Lyr '), layer.id);  
        desc.putReference(app.charIDToTypeID('null'), ref);  
        executeAction(app.charIDToTypeID('slct'), desc, DialogModes.NO); 
        return layer;  
    }  
  
  
    function openSmartObject() {  
        var descriptor = new ActionDescriptor();  
        executeAction(stringIDToTypeID( "placedLayerEditContents" ), descriptor, DialogModes.NO);  
    }  

    function layerBackward(){
	var idslct = charIDToTypeID( "slct" );
	    var desc9 = new ActionDescriptor();
	    var idnull = charIDToTypeID( "null" );
 	       var ref6 = new ActionReference();
	        var idLyr = charIDToTypeID( "Lyr " );
	        var idOrdn = charIDToTypeID( "Ordn" );
	        var idBckw = charIDToTypeID( "Bckw" );
 	       ref6.putEnumerated( idLyr, idOrdn, idBckw );
	    desc9.putReference( idnull, ref6 );
	    var idMkVs = charIDToTypeID( "MkVs" );
	    desc9.putBoolean( idMkVs, false );
	executeAction( idslct, desc9, DialogModes.NO );
	}

	function moveLayerUpOrDown(Direction) {  
		switch(Direction.toLowerCase()){  
		    case 'up' : Direction = 'Nxt '; break;  
		    case 'down' : Direction = 'Prvs'; break;  
		    default : Direction = 'Prvs'; break;  
		}  
		var desc = new ActionDescriptor();  
		var ref = new ActionReference();  
		ref.putEnumerated(charIDToTypeID('Lyr '),charIDToTypeID('Ordn'),charIDToTypeID('Trgt') );  
		desc.putReference(charIDToTypeID('null'), ref );  
		var ref2 = new ActionReference();  
		ref2.putEnumerated(charIDToTypeID('Lyr '),charIDToTypeID('Ordn'),charIDToTypeID(Direction) );  
		try{  
			desc.putReference(charIDToTypeID('T   '), ref2 ); executeAction(charIDToTypeID('move'), desc, DialogModes.NO );  
		}
		catch(e){}
	}  