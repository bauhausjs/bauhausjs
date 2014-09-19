/******************************************************************************************
#
#       Copyright 2014 Dustin Robert Hoffner
#
#       Licensed under the Apache License, Version 2.0 (the "License");
#       you may not use this file except in compliance with the License.
#       You may obtain a copy of the License at
#
#         http://www.apache.org/licenses/LICENSE-2.0
#
#       Unless required by applicable law or agreed to in writing, software
#       distributed under the License is distributed on an "AS IS" BASIS,
#       WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#       See the License for the specific language governing permissions and
#       limitations under the License.
#       
#       Projectname...................: pragm
#
#       Developer/Date................: Dustin Robert Hoffner, 16.01.2014
#       Filename......................: addFile.js
#       Version/Release...............: 0.5xx
#
******************************************************************************************/

var addFile_typ = function addFile_typ(){

    this.AddFile = false;
    this.AddFileChoice = false;

    this.toggleAddFile = function(){
        if(this.AddFile){
            document.getElementById('AddFile').className = 'dirButtonsLi';
            this.AddFile = false;
        } else {
            document.getElementById('AddFile').className = 'dirButtonsLiAdd';
            this.AddFile = true;
            document.getElementById('AddFileInput').focus();
        }
    }
    
    this.AddFileD = function(x){
        if(x){
            document.getElementById('AddFile').className = 'dirButtonsLiAdd';
            this.AddFile = true;
        }else{
            document.getElementById('AddFile').className = 'dirButtonsLi';
            this.AddFile = false;
        }
    }//
    
    this.toggleAddFileChoice = function(){
        if(this.AddFileChoice){
            /*document.getElementById('AddFileChoice').src = 'img/doc/file.png';
            document.getElementById('AddFileChoice').style.bottom = '0px';*/
            document.getElementById('awsomefilechoice').className = "fa fa-file-text addFileIcon";
            this.AddFileChoice = false;
            document.getElementById('AddFileInput').focus();
        } else {
            /*document.getElementById('AddFileChoice').src = 'img/doc/folder.png';
            document.getElementById('AddFileChoice').style.bottom = '3px';*/
            document.getElementById('awsomefilechoice').className = "fa fa-folder addFileIcon";
            this.AddFileChoice = true;
            document.getElementById('AddFileInput').focus();
        }
    }
    
    this.checkEnter = function(){  
      if(event.keyCode == 13){
        this.AddFileEnter();
      }  
    }
    
    this.AddFileEnter = function(){
        var fileType = 'p';
        if(this.AddFileChoice){
            fileType = 'f';
        }
        var fileName = document.getElementById('AddFileInput').value;
        this.AddFileD(false);
        document.getElementById('AddFileInput').value = "";
        document.getElementById('AddFileInput').blur();
        //console.log(fileType+' '+fileName);
        uiControl.addFile(fileName, fileType);
    }
}

var addFile = new addFile_typ();

var dirCreator_typ = function dirCreator_typ(){
    
    this.dirObject = {};
    this.lastDir = "";
    this.mainDir = "";
    
    this.searchParent = function(id, dirObject){
        for(key in dirObject){
            var first = key.substr(0,1);
            if(first == "4" || first == "5"){
                if(dirObject[key].content.indexOf(id) != -1){
                    return key;
                }
            }
        }
        return false;
    };
    
    this.setDir = function(jsontext){
        this.dirObject = JSON.parse(jsontext);
    };
    
    this.getName = function(id){
        if(this.dirObject[id]){
            return this.dirObject[id].name;
        } else {
            return "unnamed file";
        }
    };
    
    this.showDir = function(id){
        uiControl.view('files');
        if(this.dirObject[id]){
            var content = this.dirObject[id].content;
            var contentArray = content.split(';');
            var html = "";
            for(i in contentArray){
                if(this.dirObject[contentArray[i]]){
                    name = this.getName(contentArray[i]);
                    html = html+this.createElement(contentArray[i], name);
                }
            }
            if(document.getElementById('fileListUl')){
                //document.getElementById('fileListUl').innerHTML = html;
            } else {
                console.log('Error: Can not load filelist to DOM');
            }
        } else {
            console.log("Error: Unknown Concept Bug [1] Issue #56");
        }
    };
    
    this.generateFileSuperPath = function(id){
        if(this.dirObject[id]){
            var name = this.dirObject[id].name;
            var html = this.createFolderElement(id, name);
            while(id != this.mainDir){
                id = this.dirObject[id].parent;
                name = this.dirObject[id].name;
                html = this.createFolderElement(id, name)+html;
            }
            if(document.getElementById('fileListUl')){
                //document.getElementById('dirShow').innerHTML = html;
            }
        } else {
            console.log("Error: Unknown Concept Bug [2] Issue #56");
        }
    };
    
    this.refreshShow = function(){
        this.showDir(this.lastDir);
        this.generateFileSuperPath(this.lastDir);
    };
    
    this.openFile = function(id){
        switch(id.substr(0,1)){
            case "3":
                //Datei Oeffnen
                uiControl.loadFile(id);
                break;
            case "4":
                this.showDir(id);
                this.generateFileSuperPath(id);
                this.lastDir = id;
                break;
            case "5":
                this.showDir(id);
                this.generateFileSuperPath(id);
                this.lastDir = id;
                break;
        }
    };
    
    this.createElement = function(id, name){
        var t = new Array("fileIcon", "file");
        switch(id.substr(0,1)){
                case "3":
                t[0] = "fileIcon";
                t[1] = "file";
                break;
                case "4":
                t[0] = "folderIcon";
                t[1] = "folder";
                break;
                case "5":
                t[0] = "fileIcon";
                t[1] = "user";
                break;
        }
        id = "'"+id+"'";
        var e = '<li><img src="img/doc/'+t[1]+'.png" class="'+t[0]+'"><font class="filenameDir" style="position: relative; left: 30px;" onclick="dirCreator.openFile('+id+');">'+name+'</font><img src="img/gear.png" class="gearIcon"><img src="img/share.png" class="shareIcon"></li>';
        return e;
    };
    
    this.createFolderElement = function(id, name){
        id = "'"+id+"'";
        var e = '<li onclick="dirCreator.openFile('+id+');">'+name+'</li>';
        return e;
    };
}

var dirCreator = new dirCreator_typ();
//dirCreator.setDir(testtext);

function OpenInNewTab(){
  var win=window.open("https://github.com/pragm/pragmnote", '_blank');
  win.focus();
}