/*
@license textAngular
Author : Austin Anderson
License : 2013 MIT
Version 1.3.7

See README.md or https://github.com/fraywing/textAngular/wiki for requirements and use.
*/
angular.module('textAngularSetup', [])

// Here we set up the global display defaults, to set your own use a angular $provider#decorator.
.value('taOptions',  {
	toolbar: [
		['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre', 'quote'],
		['bold', 'italics', 'underline', 'strikeThrough', 'ul', 'ol', 'redo', 'undo', 'clear'],
		['justifyLeft','justifyCenter','justifyRight','indent','outdent'],
		['html', 'insertImage', 'insertLink', 'insertVideo', 'wordcount', 'charcount']
	],
	classes: {
		focussed: "focussed",
		toolbar: "btn-toolbar",
		toolbarGroup: "btn-group",
		toolbarButton: "btn btn-default",
		toolbarButtonActive: "active",
		disabled: "disabled",
		textEditor: 'form-control',
		htmlEditor: 'form-control'
	},
	setup: {
		// wysiwyg mode
		textEditorSetup: function($element){ /* Do some processing here */ },
		// raw html
		htmlEditorSetup: function($element){ /* Do some processing here */ }
	},
	defaultFileDropHandler:
		/* istanbul ignore next: untestable image processing */
		function(file, insertAction){
			var reader = new FileReader();
			if(file.type.substring(0, 5) === 'image'){
				reader.onload = function() {
					if(reader.result !== '') insertAction('insertImage', reader.result, true);
				};

				reader.readAsDataURL(file);
				// NOTE: For async procedures return a promise and resolve it when the editor should update the model.
				return true;
			}
			return false;
		}
})

// This is the element selector string that is used to catch click events within a taBind, prevents the default and $emits a 'ta-element-select' event
// these are individually used in an angular.element().find() call. What can go here depends on whether you have full jQuery loaded or just jQLite with angularjs.
// div is only used as div.ta-insert-video caught in filter.
.value('taSelectableElements', ['a','img'])

// This is an array of objects with the following options:
//				selector: <string> a jqLite or jQuery selector string
//				customAttribute: <string> an attribute to search for
//				renderLogic: <function(element)>
// Both or one of selector and customAttribute must be defined.
.value('taCustomRenderers', [
	{
		// Parse back out: '<div class="ta-insert-video" ta-insert-video src="' + urlLink + '" allowfullscreen="true" width="300" frameborder="0" height="250"></div>'
		// To correct video element. For now only support youtube
		selector: 'img',
		customAttribute: 'ta-insert-video',
		renderLogic: function(element){
			var iframe = angular.element('<iframe></iframe>');
			var attributes = element.prop("attributes");
			// loop through element attributes and apply them on iframe
			angular.forEach(attributes, function(attr) {
				iframe.attr(attr.name, attr.value);
			});
			iframe.attr('src', iframe.attr('ta-insert-video'));
			element.replaceWith(iframe);
		}
	}
])

.value('taTranslations', {
	// moved to sub-elements
	//toggleHTML: "Toggle HTML",
	//insertImage: "Please enter a image URL to insert",
	//insertLink: "Please enter a URL to insert",
	//insertVideo: "Please enter a youtube URL to embed",
	html: {
		tooltip: 'Toggle html / Rich Text'
	},
	// tooltip for heading - might be worth splitting
	heading: {
		tooltip: 'Heading '
	},
	p: {
		tooltip: 'Paragraph'
	},
	pre: {
		tooltip: 'Preformatted text'
	},
	ul: {
		tooltip: 'Unordered List'
	},
	ol: {
		tooltip: 'Ordered List'
	},
	quote: {
		tooltip: 'Quote/unquote selection or paragraph'
	},
	undo: {
		tooltip: 'Undo'
	},
	redo: {
		tooltip: 'Redo'
	},
	bold: {
		tooltip: 'Bold'
	},
	italic: {
		tooltip: 'Italic'
	},
	underline: {
		tooltip: 'Underline'
	},
	strikeThrough:{
		tooltip: 'Strikethrough'
	},
	justifyLeft: {
		tooltip: 'Align text left'
	},
	justifyRight: {
		tooltip: 'Align text right'
	},
	justifyCenter: {
		tooltip: 'Center'
	},
	indent: {
		tooltip: 'Increase indent'
	},
	outdent: {
		tooltip: 'Decrease indent'
	},
	clear: {
		tooltip: 'Clear formatting'
	},
	insertImage: {
		dialogPrompt: 'Please enter an image URL to insert',
		tooltip: 'Insert image',
		hotkey: 'the - possibly language dependent hotkey ... for some future implementation'
	},
	insertImageUpload: {
		dialogPrompt: 'Please enter the resolution to crop out'
	},
	insertVideo: {
		tooltip: 'Insert video',
		dialogPrompt: 'Please enter a youtube URL to embed'
	},
	insertLink: {
		tooltip: 'Insert / edit link',
		dialogPrompt: "Please enter a URL to insert"
	},
	editLink: {
		reLinkButton: {
			tooltip: "Relink"
		},
		unLinkButton: {
			tooltip: "Unlink"
		},
		targetToggle: {
			buttontext: "Open in New Window"
		}
	},
	wordcount: {
		tooltip: 'Display words Count'
	},
		charcount: {
		tooltip: 'Display characters Count'
	}
})
.run(['taRegisterTool', '$window', 'taTranslations', 'taSelection', function(taRegisterTool, $window, taTranslations, taSelection){
	taRegisterTool("html", {
		iconclass: 'fa fa-code',
		tooltiptext: taTranslations.html.tooltip,
		action: function(){
			this.$editor().switchView();
		},
		activeState: function(){
			return this.$editor().showHtml;
		}
	});
	// add the Header tools
	// convenience functions so that the loop works correctly
	var _retActiveStateFunction = function(q){
		return function(){ return this.$editor().queryFormatBlockState(q); };
	};
	var headerAction = function(){
		return this.$editor().wrapSelection("formatBlock", "<" + this.name.toUpperCase() +">");
	};
	angular.forEach(['h1','h2','h3','h4','h5','h6'], function(h){
		taRegisterTool(h.toLowerCase(), {
			buttontext: h.toUpperCase(),
			tooltiptext: taTranslations.heading.tooltip + h.charAt(1),
			action: headerAction,
			activeState: _retActiveStateFunction(h.toLowerCase())
		});
	});
	taRegisterTool('p', {
		buttontext: 'P',
		tooltiptext: taTranslations.p.tooltip,
		action: function(){
			return this.$editor().wrapSelection("formatBlock", "<P>");
		},
		activeState: function(){ return this.$editor().queryFormatBlockState('p'); }
	});
	// key: pre -> taTranslations[key].tooltip, taTranslations[key].buttontext
	taRegisterTool('pre', {
		buttontext: 'pre',
		tooltiptext: taTranslations.pre.tooltip,
		action: function(){
			return this.$editor().wrapSelection("formatBlock", "<PRE>");
		},
		activeState: function(){ return this.$editor().queryFormatBlockState('pre'); }
	});
	taRegisterTool('ul', {
		iconclass: 'fa fa-list-ul',
		tooltiptext: taTranslations.ul.tooltip,
		action: function(){
			return this.$editor().wrapSelection("insertUnorderedList", null);
		},
		activeState: function(){ return this.$editor().queryCommandState('insertUnorderedList'); }
	});
	taRegisterTool('ol', {
		iconclass: 'fa fa-list-ol',
		tooltiptext: taTranslations.ol.tooltip,
		action: function(){
			return this.$editor().wrapSelection("insertOrderedList", null);
		},
		activeState: function(){ return this.$editor().queryCommandState('insertOrderedList'); }
	});
	taRegisterTool('quote', {
		iconclass: 'fa fa-quote-right',
		tooltiptext: taTranslations.quote.tooltip,
		action: function(){
			return this.$editor().wrapSelection("formatBlock", "<BLOCKQUOTE>");
		},
		activeState: function(){ return this.$editor().queryFormatBlockState('blockquote'); }
	});
	taRegisterTool('undo', {
		iconclass: 'fa fa-undo',
		tooltiptext: taTranslations.undo.tooltip,
		action: function(){
			return this.$editor().wrapSelection("undo", null);
		}
	});
	taRegisterTool('redo', {
		iconclass: 'fa fa-repeat',
		tooltiptext: taTranslations.redo.tooltip,
		action: function(){
			return this.$editor().wrapSelection("redo", null);
		}
	});
	taRegisterTool('bold', {
		iconclass: 'fa fa-bold',
		tooltiptext: taTranslations.bold.tooltip,
		action: function(){
			return this.$editor().wrapSelection("bold", null);
		},
		activeState: function(){
			return this.$editor().queryCommandState('bold');
		},
		commandKeyCode: 98
	});
	taRegisterTool('justifyLeft', {
		iconclass: 'fa fa-align-left',
		tooltiptext: taTranslations.justifyLeft.tooltip,
		action: function(){
			return this.$editor().wrapSelection("justifyLeft", null);
		},
		activeState: function(commonElement){
			var result = false;
			if(commonElement) result =
				commonElement.css('text-align') === 'left' ||
				commonElement.attr('align') === 'left' ||
				(
					commonElement.css('text-align') !== 'right' &&
					commonElement.css('text-align') !== 'center' &&
					commonElement.css('text-align') !== 'justify' &&
					!this.$editor().queryCommandState('justifyRight') &&
					!this.$editor().queryCommandState('justifyCenter')
				) && !this.$editor().queryCommandState('justifyFull');
			result = result || this.$editor().queryCommandState('justifyLeft');
			return result;
		}
	});
	taRegisterTool('justifyRight', {
		iconclass: 'fa fa-align-right',
		tooltiptext: taTranslations.justifyRight.tooltip,
		action: function(){
			return this.$editor().wrapSelection("justifyRight", null);
		},
		activeState: function(commonElement){
			var result = false;
			if(commonElement) result = commonElement.css('text-align') === 'right';
			result = result || this.$editor().queryCommandState('justifyRight');
			return result;
		}
	});
	taRegisterTool('justifyCenter', {
		iconclass: 'fa fa-align-center',
		tooltiptext: taTranslations.justifyCenter.tooltip,
		action: function(){
			return this.$editor().wrapSelection("justifyCenter", null);
		},
		activeState: function(commonElement){
			var result = false;
			if(commonElement) result = commonElement.css('text-align') === 'center';
			result = result || this.$editor().queryCommandState('justifyCenter');
			return result;
		}
	});
	taRegisterTool('indent', {
		iconclass: 'fa fa-indent',
		tooltiptext: taTranslations.indent.tooltip,
		action: function(){
			return this.$editor().wrapSelection("indent", null);
		},
		activeState: function(){
			return this.$editor().queryFormatBlockState('blockquote');
		}
	});
	taRegisterTool('outdent', {
		iconclass: 'fa fa-outdent',
		tooltiptext: taTranslations.outdent.tooltip,
		action: function(){
			return this.$editor().wrapSelection("outdent", null);
		},
		activeState: function(){
			return false;
		}
	});
	taRegisterTool('italics', {
		iconclass: 'fa fa-italic',
		tooltiptext: taTranslations.italic.tooltip,
		action: function(){
			return this.$editor().wrapSelection("italic", null);
		},
		activeState: function(){
			return this.$editor().queryCommandState('italic');
		},
		commandKeyCode: 105
	});
	taRegisterTool('underline', {
		iconclass: 'fa fa-underline',
		tooltiptext: taTranslations.underline.tooltip,
		action: function(){
			return this.$editor().wrapSelection("underline", null);
		},
		activeState: function(){
			return this.$editor().queryCommandState('underline');
		},
		commandKeyCode: 117
	});
	taRegisterTool('strikeThrough', {
		iconclass: 'fa fa-strikethrough',
		action: function(){
			return this.$editor().wrapSelection("strikeThrough", null);
		},
		activeState: function(){
			return document.queryCommandState('strikeThrough');
		}
	});
	taRegisterTool('clear', {
		iconclass: 'fa fa-ban',
		tooltiptext: taTranslations.clear.tooltip,
		action: function(deferred, restoreSelection){
			var i;
			this.$editor().wrapSelection("removeFormat", null);
			var possibleNodes = angular.element(taSelection.getSelectionElement());
			// remove lists
			var removeListElements = function(list){
				list = angular.element(list);
				var prevElement = list;
				angular.forEach(list.children(), function(liElem){
					var newElem = angular.element('<p></p>');
					newElem.html(angular.element(liElem).html());
					prevElement.after(newElem);
					prevElement = newElem;
				});
				list.remove();
			};
			angular.forEach(possibleNodes.find("ul"), removeListElements);
			angular.forEach(possibleNodes.find("ol"), removeListElements);
			if(possibleNodes[0].tagName.toLowerCase() === 'li'){
				var _list = possibleNodes[0].parentNode.childNodes;
				var _preLis = [], _postLis = [], _found = false;
				for(i = 0; i < _list.length; i++){
					if(_list[i] === possibleNodes[0]){
						_found = true;
					}else if(!_found) _preLis.push(_list[i]);
					else _postLis.push(_list[i]);
				}
				var _parent = angular.element(possibleNodes[0].parentNode);
				var newElem = angular.element('<p></p>');
				newElem.html(angular.element(possibleNodes[0]).html());
				if(_preLis.length === 0 || _postLis.length === 0){
					if(_postLis.length === 0) _parent.after(newElem);
					else _parent[0].parentNode.insertBefore(newElem[0], _parent[0]);

					if(_preLis.length === 0 && _postLis.length === 0) _parent.remove();
					else angular.element(possibleNodes[0]).remove();
				}else{
					var _firstList = angular.element('<'+_parent[0].tagName+'></'+_parent[0].tagName+'>');
					var _secondList = angular.element('<'+_parent[0].tagName+'></'+_parent[0].tagName+'>');
					for(i = 0; i < _preLis.length; i++) _firstList.append(angular.element(_preLis[i]));
					for(i = 0; i < _postLis.length; i++) _secondList.append(angular.element(_postLis[i]));
					_parent.after(_secondList);
					_parent.after(newElem);
					_parent.after(_firstList);
					_parent.remove();
				}
				taSelection.setSelectionToElementEnd(newElem[0]);
			}
			// clear out all class attributes. These do not seem to be cleared via removeFormat
			var $editor = this.$editor();
			var recursiveRemoveClass = function(node){
				node = angular.element(node);
				if(node[0] !== $editor.displayElements.text[0]) node.removeAttr('class');
				angular.forEach(node.children(), recursiveRemoveClass);
			};
			angular.forEach(possibleNodes, recursiveRemoveClass);
			// check if in list. If not in list then use formatBlock option
			if(possibleNodes[0].tagName.toLowerCase() !== 'li' &&
				possibleNodes[0].tagName.toLowerCase() !== 'ol' &&
				possibleNodes[0].tagName.toLowerCase() !== 'ul') this.$editor().wrapSelection("formatBlock", "default");
			restoreSelection();
		}
	});

	var imgOnSelectAction = function(event, $element, editorScope){
		// setup the editor toolbar
		// Credit to the work at http://hackerwins.github.io/summernote/ for this editbar logic/display
		var finishEdit = function(){
			editorScope.updateTaBindtaTextElement();
			editorScope.hidePopover();
		};
		event.preventDefault();
		editorScope.displayElements.popover.css('width', '375px');
		var container = editorScope.displayElements.popoverContainer;
		container.empty();
		var buttonGroup = angular.element('<div class="btn-group" style="padding-right: 6px;">');
		var fullButton = angular.element('<button type="button" class="btn btn-default btn-sm btn-small" unselectable="on" tabindex="-1">100% </button>');
		fullButton.on('click', function(event){
			event.preventDefault();
			$element.css({
				'width': '100%',
				'height': ''
			});
			finishEdit();
		});
		var halfButton = angular.element('<button type="button" class="btn btn-default btn-sm btn-small" unselectable="on" tabindex="-1">50% </button>');
		halfButton.on('click', function(event){
			event.preventDefault();
			$element.css({
				'width': '50%',
				'height': ''
			});
			finishEdit();
		});
		var quartButton = angular.element('<button type="button" class="btn btn-default btn-sm btn-small" unselectable="on" tabindex="-1">25% </button>');
		quartButton.on('click', function(event){
			event.preventDefault();
			$element.css({
				'width': '25%',
				'height': ''
			});
			finishEdit();
		});
		var resetButton = angular.element('<button type="button" class="btn btn-default btn-sm btn-small" unselectable="on" tabindex="-1">Reset</button>');
		resetButton.on('click', function(event){
			event.preventDefault();
			$element.css({
				width: '',
				height: ''
			});
			finishEdit();
		});
		buttonGroup.append(fullButton);
		buttonGroup.append(halfButton);
		buttonGroup.append(quartButton);
		buttonGroup.append(resetButton);
		container.append(buttonGroup);

		buttonGroup = angular.element('<div class="btn-group" style="padding-right: 6px;">');
		var floatLeft = angular.element('<button type="button" class="btn btn-default btn-sm btn-small" unselectable="on" tabindex="-1"><i class="fa fa-align-left"></i></button>');
		floatLeft.on('click', function(event){
			event.preventDefault();
			// webkit
			$element.css('float', 'left');
			// firefox
			$element.css('cssFloat', 'left');
			// IE < 8
			$element.css('styleFloat', 'left');
			finishEdit();
		});
		var floatRight = angular.element('<button type="button" class="btn btn-default btn-sm btn-small" unselectable="on" tabindex="-1"><i class="fa fa-align-right"></i></button>');
		floatRight.on('click', function(event){
			event.preventDefault();
			// webkit
			$element.css('float', 'right');
			// firefox
			$element.css('cssFloat', 'right');
			// IE < 8
			$element.css('styleFloat', 'right');
			finishEdit();
		});
		var floatNone = angular.element('<button type="button" class="btn btn-default btn-sm btn-small" unselectable="on" tabindex="-1"><i class="fa fa-align-justify"></i></button>');
		floatNone.on('click', function(event){
			event.preventDefault();
			// webkit
			$element.css('float', '');
			// firefox
			$element.css('cssFloat', '');
			// IE < 8
			$element.css('styleFloat', '');
			finishEdit();
		});
		buttonGroup.append(floatLeft);
		buttonGroup.append(floatNone);
		buttonGroup.append(floatRight);
		container.append(buttonGroup);

		buttonGroup = angular.element('<div class="btn-group">');
		var remove = angular.element('<button type="button" class="btn btn-default btn-sm btn-small" unselectable="on" tabindex="-1"><i class="fa fa-trash-o"></i></button>');
		remove.on('click', function(event){
			event.preventDefault();
			$element.remove();
			finishEdit();
		});
		buttonGroup.append(remove);
		container.append(buttonGroup);

		editorScope.showPopover($element);
		editorScope.showResizeOverlay($element);
	};

	taRegisterTool('insertImage', {
		display: '<div id="toolbarII" style="display:block; min-width:100px;" unselectable="on"><span unselectable="on">Upload Image: </span><input type="file" accept="image/*" onchange="angular.element(this).scope().fileChange(this)" unselectable="on" ng-disabled="checkDisabled()"></div>',
		disabled: true,
		data: {},
		iconclass: 'fa fa-picture-o',
		tooltiptext: taTranslations.insertImage.tooltip,
		elem: {},
		checkDisabled: function(){
			return !this.$editor().focussed;
		},
		fileChange: function(e){
			var cropOptions = {
				width: 600,
				height: 600,
				maxSize: false,
				circle: false
			};
			var hashArr = $window.location.hash.split('/');
			if(hashArr.length !== 3){
				return alert('ID konnte nicht geladen werden! Bitte klicken Sie die Seite im Menü erneut an.');
			}
			if(hashArr[2].length !== 24){
				return alert('ID konnte nicht geladen werden! Bitte klicken Sie die Seite im Menü erneut an.');
			}
			var _id = hashArr[2];
			var model = hashArr[1];
			var splittedModel = model.split('');
			splittedModel[0] = splittedModel[0].toUpperCase()
			splittedModel.push('s');
			model = splittedModel.join('');

			var that = this;
			var cropSize = $window.prompt(taTranslations.insertImageUpload.dialogPrompt, '600x400');
			var cropArr = cropSize.split('x');
			if(cropArr.length > 1){
				var width = parseInt(cropArr[0]);
				var height = parseInt(cropArr[1]);
				if(width > 0 && height > 0){
					cropOptions.width = width;
					cropOptions.height = height;
					var startCropping = function(e, file, opts, that){
						var c = new cropImages();
						var timestamp = Date.now();
						var imageUrl = '/img/loading.gif#'+timestamp;
						var bg = that.$editor().wrapSelection('insertImage', imageUrl, true);
						//debugger;
						c.listen('oncancel', function(evt){
							evt.file.removeLoader(evt);
						});

						c.listen('export', function (evt) {
							//evt.file.cropScope.$editor().wrapSelection('insertImage', 'http://www.vetprofessionals.com/catprofessional/images/home-cat.jpg', true);
							var getHTTPObject = function () {
			                if (window.ActiveXObject) return new ActiveXObject("Microsoft.XMLHTTP");
			                else if (window.XMLHttpRequest) return new XMLHttpRequest();
			                else {
			                    alert("Dein Browser unterstuetzt kein AJAX!");
			                    return null;
			                }
			            };

							var dataURItoBlob = function (dataURI) {
								// convert base64/URLEncoded data component to raw binary data held in a string
								var byteString;
								if (dataURI.split(',')[0].indexOf('base64') >= 0)
									byteString = atob(dataURI.split(',')[1]);
								else
									byteString = unescape(dataURI.split(',')[1]);

								// separate out the mime component
								var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

								// write the bytes of the string to a typed array
								var ia = new Uint8Array(byteString.length);
								for (var i = 0; i < byteString.length; i++) {
									ia[i] = byteString.charCodeAt(i);
								}

								return new Blob([ia], {
									type: mimeString
								});
							};

							var uploadFileBlob = function (blob, data, evt, callback, progress) {
								var formData = new FormData();
								data.field = 'fields.wysiwyg';
								data.config = 'documents.'+model;
								data._id = evt.file._id;
								formData.append("data", JSON.stringify(data));
								formData.append("file", blob, data.name);

								var xhr = getHTTPObject();

								xhr.onreadystatechange = function () {
									if (xhr.readyState == 4) {
										if(xhr.status == 200){
											callback(false, evt, xhr);
										} else {
											evt.file.removeLoader(evt);
										}
									}
								};

								xhr.onerror = callback;

								if (progress && document.getElementById(progress)) {
									var progressBar = document.getElementById(progress);
									xhr.upload.onprogress = function (e) {
											if (e.lengthComputable) {
												progressBar.value = (e.loaded / e.total) * 100;
												progressBar.textContent = progressBar.value; // Fallback for unsupported browsers.
											}
									};
								};
								//console.log('data: ', data);
								xhr.open("POST", "/files/.operations/upload?data=" + encodeURIComponent(JSON.stringify(data)), true); // "+encodeURIComponent(JSON.stringify(data))+"
								xhr.send(formData);
							};
							//debugger;
							var blob = dataURItoBlob(evt.dataUrl);
							var name = evt.file.name.split('.');
							name.pop();
							uploadFileBlob(blob, {'name': name.join('_')}, evt, function(err, evt, xhr){
								if(err){
									console.error('Upload Error', err);
									evt.file.removeLoader(evt);
									return alert('Upload Fehlgeschlagen! #1');
								}
								try {
									var ret = JSON.parse(xhr.responseText);
								} catch(e){
									evt.file.removeLoader(evt);
									return alert('Upload Fehlgeschlagen! #2');
								}

								if(ret.success == false || ret.file == null){
									evt.file.removeLoader(evt);
									return alert('Upload Fehlgeschlagen! #3');
								}

								var elements = evt.file.bg.getElementsByTagName('img');
								for(var i in elements){
									if(elements[i] && elements[i].src && elements[i].src.search(evt.file.imageUrl) >= 0){
										//console.log('overflow', elements[i]);
										//elements[i].src = evt.dataUrl;
										elements[i].src = '/files'+ret.file;
									}
								}
								var te = document.createTextNode('');
								evt.file.bg.appendChild(te);
								evt.file.bg.focus();
								//debugger;
							});


							//debugger;
							//that.focus();
							//that.$editor().wrapSelection('insertImage', 'http://www.vetprofessionals.com/catprofessional/images/home-cat.jpg', true);
							//debugger;
							//var win = window.open(evt.dataUrl, '_blank');
	                	//win.focus();
							//var blob = scope.dataURItoBlob(e.dataUrl);
							//scope.uploadHandler(blob);
						});
						file.bg = bg;
						file.imageUrl = imageUrl;

						file.removeLoader = function(evt){
							var elements = evt.file.bg.getElementsByTagName('img');
							for(var i in elements){
								if(elements[i] && elements[i].src && elements[i].src.search(evt.file.imageUrl) >= 0){
									elements[i].remove();
								}
							}
							var te = document.createTextNode('');
							evt.file.bg.appendChild(te);
							evt.file.bg.focus();
						}

						c.crop(file, e, opts);
						//console.log('Läuft bei mir', e.files[0]);
					}

					var file = e.files[0];

					file._id = _id;
					file.cropScope = this;
					startCropping(e, file, cropOptions, this);
					//$window.location.hash;
					//debugger;
				}
			}

    		//document.STOP_EXEC_COMMAND = true;
			return false;
		},
		action: function(){

    		//document.STOP_EXEC_COMMAND = true;
			return true;
			//scope.elem = this;
			//var imageLink;
			//imageLink = $window.prompt(taTranslations.insertImage.dialogPrompt, 'http://');
			//if(imageLink && imageLink !== '' && imageLink !== 'http://'){
			//	this.$editor().wrapSelection('insertImage', imageLink, true);
			//	return;
			//}
		},
		onElementSelect: {
			element: 'img',
			action: imgOnSelectAction
		}
	});
	taRegisterTool('insertVideo', {
		iconclass: 'fa fa-youtube-play',
		tooltiptext: taTranslations.insertVideo.tooltip,
		action: function(){
			var urlPrompt;
			urlPrompt = $window.prompt(taTranslations.insertVideo.dialogPrompt, 'https://');
			if (urlPrompt && urlPrompt !== '' && urlPrompt !== 'https://') {
				// get the video ID
				var ids = urlPrompt.match(/(\?|&)v=[^&]*/);
				/* istanbul ignore else: if it's invalid don't worry - though probably should show some kind of error message */
				if(ids && ids.length > 0){
					// create the embed link
					var urlLink = "https://www.youtube.com/embed/" + ids[0].substring(3);
					// create the HTML
					// for all options see: http://stackoverflow.com/questions/2068344/how-do-i-get-a-youtube-video-thumbnail-from-the-youtube-api
					// maxresdefault.jpg seems to be undefined on some.
					//var embed = '<img class="ta-insert-video" src="https://img.youtube.com/vi/' + ids[0].substring(3) + '/hqdefault.jpg" ta-insert-video="' + urlLink + '" contenteditable="false" src="" allowfullscreen="true" frameborder="0" />';
					var embed = '<iframe width="640" height="360" frameborder="0" allowfullscreen="" src="'+urlLink+'"></iframe>';
					// insert
					return this.$editor().wrapSelection('insertHTML', embed, true);
				}
			}
		},
		onElementSelect: {
			element: 'img',
			onlyWithAttrs: ['ta-insert-video'],
			action: imgOnSelectAction
		}
	});
	taRegisterTool('insertLink', {
		tooltiptext: taTranslations.insertLink.tooltip,
		iconclass: 'fa fa-link',
		action: function(){
			var urlLink;
			urlLink = $window.prompt(taTranslations.insertLink.dialogPrompt, 'http://');
			if(urlLink && urlLink !== '' && urlLink !== 'http://'){
				return this.$editor().wrapSelection('createLink', urlLink, true);
			}
		},
		activeState: function(commonElement){
			if(commonElement) return commonElement[0].tagName === 'A';
			return false;
		},
		onElementSelect: {
			element: 'a',
			action: function(event, $element, editorScope){
				// setup the editor toolbar
				// Credit to the work at http://hackerwins.github.io/summernote/ for this editbar logic
				event.preventDefault();
				editorScope.displayElements.popover.css('width', '436px');
				var container = editorScope.displayElements.popoverContainer;
				container.empty();
				container.css('line-height', '28px');
				var link = angular.element('<a href="' + $element.attr('href') + '" target="_blank">' + $element.attr('href') + '</a>');
				link.css({
					'display': 'inline-block',
					'max-width': '200px',
					'overflow': 'hidden',
					'text-overflow': 'ellipsis',
					'white-space': 'nowrap',
					'vertical-align': 'middle'
				});
				container.append(link);
				var buttonGroup = angular.element('<div class="btn-group pull-right">');
				var reLinkButton = angular.element('<button type="button" class="btn btn-default btn-sm btn-small" tabindex="-1" unselectable="on" title="' + taTranslations.editLink.reLinkButton.tooltip + '"><i class="fa fa-edit icon-edit"></i></button>');
				reLinkButton.on('click', function(event){
					event.preventDefault();
					var urlLink = $window.prompt(taTranslations.insertLink.dialogPrompt, $element.attr('href'));
					if(urlLink && urlLink !== '' && urlLink !== 'http://'){
						$element.attr('href', urlLink);
						editorScope.updateTaBindtaTextElement();
					}
					editorScope.hidePopover();
				});
				buttonGroup.append(reLinkButton);
				var unLinkButton = angular.element('<button type="button" class="btn btn-default btn-sm btn-small" tabindex="-1" unselectable="on" title="' + taTranslations.editLink.unLinkButton.tooltip + '"><i class="fa fa-unlink icon-unlink"></i></button>');
				// directly before this click event is fired a digest is fired off whereby the reference to $element is orphaned off
				unLinkButton.on('click', function(event){
					event.preventDefault();
					$element.replaceWith($element.contents());
					editorScope.updateTaBindtaTextElement();
					editorScope.hidePopover();
				});
				buttonGroup.append(unLinkButton);
				var targetToggle = angular.element('<button type="button" class="btn btn-default btn-sm btn-small" tabindex="-1" unselectable="on">' + taTranslations.editLink.targetToggle.buttontext + '</button>');
				if($element.attr('target') === '_blank'){
					targetToggle.addClass('active');
				}
				targetToggle.on('click', function(event){
					event.preventDefault();
					$element.attr('target', ($element.attr('target') === '_blank') ? '' : '_blank');
					targetToggle.toggleClass('active');
					editorScope.updateTaBindtaTextElement();
				});
				buttonGroup.append(targetToggle);
				container.append(buttonGroup);
				editorScope.showPopover($element);
			}
		}
	});
	taRegisterTool('wordcount', {
		display: '<div id="toolbarWC" style="display:block; min-width:100px;">Words: <span ng-bind="wordcount"></span></div>',
		disabled: true,
		wordcount: 0,
		activeState: function(){ // this fires on keyup
			var textElement = this.$editor().displayElements.text;
			var workingHTML = textElement[0].innerHTML;
			var sourceText = workingHTML.replace(/(<[^>]*?>)/ig, ' '); // replace all html tags with spaces

			// Caculate number of words
			var sourceTextMatches = sourceText.match(/\S+/g);
			var noOfWords = sourceTextMatches && sourceTextMatches.length || 0;

			//Set current scope
			this.wordcount = noOfWords;
			//Set editor scope
			this.$editor().wordcount = noOfWords;
			return false;
		}
	});
	taRegisterTool('charcount', {
		display: '<div id="toolbarCC" style="display:block; min-width:120px;">Characters: <span ng-bind="charcount"></span></div>',
		disabled: true,
		charcount: 0,
		activeState: function(){ // this fires on keyup
			var textElement = this.$editor().displayElements.text;
			var sourceText = textElement[0].innerText || textElement[0].textContent; // to cover the non-jquery use case.

			// Caculate number of chars
			var noOfChars = sourceText.replace(/(\r\n|\n|\r)/gm,"").replace(/^\s+/g,' ').replace(/\s+$/g, ' ').length;
			//Set current scope
			this.charcount = noOfChars;
			//Set editor scope
			this.$editor().charcount = noOfChars;
			return false;
		}
	});
}]);
