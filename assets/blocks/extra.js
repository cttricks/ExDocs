/**
 * Thanks to @ColinTree for the GitBook Plugin, based on which this script is written
 * https://github.com/ColinTree/gitbook-plugin-ai2-blocks
 */

const COLOUR_EVENT = '#ffad3a';
const COLOUR_METHOD = '#7560A4';
const COLOUR_GET = '#20BF6B';
const COLOUR_SET = '#20BF6B';

var ComponentName = "Component";

var CONF_TEXT_WHEN = 'when';
var CONF_TEXT_DO = 'do';
var CONF_TEXT_CALL = 'call';
var CONF_TEXT_SET = 'set';
var CONF_SCALE_LEVEL = 1;
var CONF_MARGIN_LEFT = 0;
var CONF_MARGIN_TOP = 0;
var CONF_MARGIN_RIGHT = 0;
var CONF_MARGIN_BOTTOM = 0;

// It will be increased automatically by getBlock(json)
var blockIndex = 0;
var blockId = 'block0';

function renderAndGetBlock(id, scale, margin_left, margin_top, margin_right, margin_bottom) {
    var workspace = Blockly.inject(id, {
        toolbox: false,
        trashcan: false,
        readOnly: true,
        scrollbars: false
    });
    workspace.setScale(scale);

    var block = workspace.newBlock('renderedBlock_' + id);
    block.initSvg();
    block.moveBy(8 + margin_left, margin_top);
    block.render();

    var metrics = workspace.getMetrics();
    $("#" + id)
        .height(metrics.contentHeight + margin_top + margin_bottom)
        .width(metrics.contentWidth + 8 + margin_left + margin_right);
    Blockly.svgResize(workspace);
    workspace.render();
    return block;
}


// We have the seperate function for the Event block to add styling to the parameters
// so that they appear in the same colour as in Kodular Creator
function renderEventBlock(id, params_count) {
    var block = renderAndGetBlock(id, 1, 0, 0, 0, 0, 0);
    for (var i = 0; i < params_count; i++) {
        if (block.getField('VAR' + i)) {
            Blockly.utils.addClass(block.getField('VAR' + i).fieldGroup_, "event-parameter");
        }
    }
}

/**
 * Returns the data a required block
 * @param json data about a single block
 * @returns object or null
 */
function getBlock(json) {
    blockIndex++;
    blockId = 'block' + blockIndex;
    var blockData = JSON.parse(json);
    if (typeof (blockData) != "object") {
        console.error("block info is not a json object");
        return null;
    }
    if (typeof (blockData['componentName']) != "undefined" && blockData['componentName'].length > 0) {
        ComponentName = blockData.componentName;
    }
    return blockData;
}

function renderSingleBlockDiv(divElement) {
    var block = getBlock(decodeURI(divElement.getAttribute('value')));
    divElement.setAttribute('id', blockId)
    divElement.style.display = 'block'; // show

    var type = divElement.getAttribute("ai2-block");
    var name = block['name'];
    var scale = block['scale'] || CONF_SCALE_LEVEL;
    var margin_left = block['margin_left'] || block['margin'] || CONF_MARGIN_LEFT;
    var margin_top = block['margin_top'] || block['margin'] || CONF_MARGIN_TOP;
    var margin_right = block['margin_right'] || block['margin'] || CONF_MARGIN_RIGHT;
    var margin_bottom = block['margin_bottom'] || block['margin'] || CONF_MARGIN_BOTTOM;
    if (type == 'method') {
        var param = block['param'] || block['arg'] || [];
        var output = block['output'] === true;

        Blockly.Blocks['renderedBlock_' + blockId] = {
            init: function () {
                this.appendDummyInput().appendField(CONF_TEXT_CALL).appendField(new Blockly.FieldDropdown([[ComponentName, 'OPTIONNAME']]), 'COMPONENT_SELECTOR').appendField('.' + name);
                for (var i = 0; i < param.length; i++) {
                    this.appendValueInput('NAME').setAlign(Blockly.ALIGN_RIGHT).appendField(param[i]);
                }
                this.setInputsInline(false);
                if (output) {
                    this.setOutput(true, null);
                } else {
                    this.setPreviousStatement(true, null);
                    this.setNextStatement(true, null);
                }
                this.setColour(COLOUR_METHOD);
            }
        };

        // EVENTS
    } else if (type == 'event') {
        var param = block['param'] || block['arg'] || [];

        Blockly.Blocks['renderedBlock_' + blockId] = {
            init: function () {
                this.appendDummyInput('').appendField(CONF_TEXT_WHEN).appendField(new Blockly.FieldDropdown([[ComponentName, 'OPTIONNAME']]), "COMPONENT_SELECTOR").appendField('.' + name);
                if (param.length > 0) {
                    var paramInput = this.appendDummyInput('PARAMETERS').appendField(" ").setAlign(Blockly.ALIGN_LEFT);
                    for (var i = 0; i < param.length; i++) {
                        paramInput.appendField(new Blockly.FieldTextInput(param[i]), 'VAR' + i).appendField(" ");
                    }
                }
                this.appendStatementInput("DO").appendField(CONF_TEXT_DO);
                this.setInputsInline(false);
                this.setPreviousStatement(false, null);
                this.setNextStatement(false, null);
                this.setColour(COLOUR_EVENT);
                // Trying to render the block here goes into an infinite loop for some reason
                // renderEventBlock(blockId, param.length);
                // return;
            }
        };

        // PROPERTIES
    } else if (type == 'property') {
        var getter = block['getter'];
        if (getter !== true && getter !== false) {
            getter = true;
        }

        Blockly.Blocks['renderedBlock_' + blockId] = {
            init: function () {
                var input;
                if (getter) {
                    input = this.appendDummyInput();
                    this.setOutput(true, null);
                } else {
                    input = this.appendValueInput("NAME").appendField(CONF_TEXT_SET);
                    this.setPreviousStatement(true, null);
                    this.setNextStatement(true, null);
                }
                input.appendField(new Blockly.FieldDropdown([[ComponentName, 'OPTIONNAME']]), "NAME")
                    .appendField(".")
                    .appendField(new Blockly.FieldDropdown([[name, "OPTIONNAME"]]), "NAME2");
                this.setColour(getter ? COLOUR_GET : COLOUR_SET);
                if (!getter) {
                    input.appendField(' to ');
                }
            }
        };
    } else if (type == 'method') {
        var param = block['param'] || block['arg'] || [];
        var output = block['output'] === true;

        Blockly.Blocks['renderedBlock_' + blockId] = {
            init: function () {
                this.appendDummyInput().appendField(CONF_TEXT_CALL).appendField(new Blockly.FieldDropdown([[ComponentName, 'OPTIONNAME']]), 'COMPONENT_SELECTOR').appendField('.' + name);
                for (var i = 0; i < param.length; i++) {
                    this.appendValueInput('NAME').setAlign(Blockly.ALIGN_RIGHT).appendField(param[i]);
                }
                this.setInputsInline(false);
                if (output) {
                    this.setOutput(true, null);
                } else {
                    this.setPreviousStatement(true, null);
                    this.setNextStatement(true, null);
                }
                this.setColour(COLOUR_METHOD);
            }
        };
    }
    if (type == 'event') {
        renderEventBlock(blockId, block['param'].length || 0);
    } else {
        renderAndGetBlock(blockId, scale, margin_left, margin_top, margin_right, margin_bottom);
    }
    divElement.removeAttribute('not-rendered');


}

function composeBlockes(){
    allBlockDivs = document.getElementsByClassName('block');
    for (var i = 0; i < allBlockDivs.length; i++) {
        renderSingleBlockDiv(allBlockDivs[i]);
    }
	
	console.log("DONE");
}


function composeUI(data){
	//compose Left Section
	datacontainer.innerHTML = "";
	console.log("Compiling DOM");
	console.log(data);

	//insert name title desc and space
	let title = document.createElement("H1");
	title.innerHTML = data.name;
	document.title = data.name + " - ExDocs";

	let desc = document.createElement("P");
	desc.innerHTML = data.helpString;

	datacontainer.appendChild(title);
	datacontainer.appendChild(desc);

	//check if method blocks available
	if(data.methods.length > 0){
		var devider = document.createElement("DIV");
		devider.classList.add("devider");
		datacontainer.appendChild(devider);

		let method = document.createElement("H2");
		method.innerHTML = "Method Block";
		method.classList.add("blockName");
		datacontainer.appendChild(method);

		data.methods.forEach((e)=>{
			var desc1 = ``;
			//check for parameters
			var params = [];
			e.params.forEach((p)=>{
				desc1+=`<br>➜ ${p.name} input type is <span class="input_${p.type}">${p.type}<span>`;
				params.push(p.name);
			});

			desc1+= `<br>`;

			var temp_value = {
				"componentName": data.name,
				"name": e.name,
				"output" : (e.returnType)? true : false,
				"param": params
			}

			var block = document.createElement("DIV");
			block.classList.add("block");
			block.setAttribute("ai2-block","method");
			block.setAttribute("value", encodeURI(JSON.stringify(temp_value)));

			var blocksTi = document.createElement("P");
			blocksTi.innerHTML = `<b>${e.name}</b> - ${e.description}.`;
			blocksTi.classList.add("blocs_desc");

			var blocksDe = document.createElement("P");
			blocksDe.innerHTML = desc1;
			blocksDe.classList.add("blocs_inputinfo");

			//insert in dom
			datacontainer.appendChild(block);
			datacontainer.appendChild(blocksTi);
			datacontainer.appendChild(blocksDe);
		});
	}

	if(data.events.length > 0){
		var devider = document.createElement("DIV");
		devider.classList.add("devider");
		datacontainer.appendChild(devider);

		let method = document.createElement("H2");
		method.innerHTML = "Event Block";
		method.classList.add("blockName");
		datacontainer.appendChild(method);

		data.events.forEach((e)=>{
			var desc1 = ``;
			//check for parameters
			var params = [];
			e.params.forEach((p)=>{
				desc1+=`<br>➜ ${p.name} output type is <span class="input_${p.type}">${p.type}<span>`;
				params.push(p.name);
			});

			desc1+= `<br>`;

			var temp_value = {
				"componentName": data.name,
				"name": e.name,
				"param": params
			}

			var block = document.createElement("DIV");
			block.classList.add("block");
			block.setAttribute("ai2-block","event");
			block.setAttribute("value", encodeURI(JSON.stringify(temp_value)));

			var blocksTi = document.createElement("P");
			blocksTi.innerHTML = `<b>${e.name}</b> - ${e.description}.`;
			blocksTi.classList.add("blocs_desc");

			var blocksDe = document.createElement("P");
			blocksDe.innerHTML = desc1;
			blocksDe.classList.add("blocs_inputinfo");

			//insert in dom
			datacontainer.appendChild(block);
			datacontainer.appendChild(blocksTi);
			datacontainer.appendChild(blocksDe);
		});
	}

	if(data.blockProperties.length > 0){
		var devider = document.createElement("DIV");
		devider.classList.add("devider");
		datacontainer.appendChild(devider);

		let method = document.createElement("H2");
		method.innerHTML = "Properties Block";
		method.classList.add("blockName");
		datacontainer.appendChild(method);

		data.blockProperties.forEach((e)=>{
			var desc1 = ``;

			if(e.rw.includes("write")){
				var temp_value = {
					"componentName": data.name,
					"name": e.name,
					"getter": false
				}

				desc1+= `, here the input type is <span class="input_${e.type}">${e.type}<span>`;

				var block = document.createElement("DIV");
				block.classList.add("block");
				block.setAttribute("ai2-block","property");
				block.setAttribute("value", encodeURI(JSON.stringify(temp_value)));
				datacontainer.appendChild(block);
			}

			if(e.rw.includes("read")){
				var temp_value = {
					"componentName": data.name,
					"name": e.name,
					"getter": true
				}

				desc1+= `, here the output type is <span class="input_${e.type}">${e.type}<span>`;

				var block = document.createElement("DIV");
				block.classList.add("block");
				block.setAttribute("ai2-block","property");
				block.setAttribute("value", encodeURI(JSON.stringify(temp_value)));
				datacontainer.appendChild(block);

			}


			var blocksTi = document.createElement("P");
			blocksTi.innerHTML = `<b>${e.name}</b> - ${e.description} ${desc1}.`;
			blocksTi.classList.add("blocs_desc");
			datacontainer.appendChild(blocksTi);

		});

	}

	//compose RightSide
	infocontainer.innerHTML = `<ul>
		<li>
			<div class="xinfo">
				<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 20 20" height="18px" viewBox="0 0 20 20" width="18px" fill="#494545"><g><rect fill="none" height="20" width="20" y="0"/></g><g><g><path d="M16.5,2h-13C2.67,2,2,2.67,2,3.5v3c0,0.65,0.42,1.2,1,1.41v8.59C3,17.33,3.67,18,4.5,18h11c0.83,0,1.5-0.67,1.5-1.5V7.91 c0.58-0.21,1-0.76,1-1.41v-3C18,2.67,17.33,2,16.5,2z M16.5,6.5h-13v-3h13V6.5z M4.5,16.5V8h11v8.5H4.5z"/><rect height="1.5" width="4" x="8" y="10"/></g></g></svg>
				Package Name
			</div>
			<p>${params.id}</p>
		</li>
		<li>
			<div class="xinfo">
				<svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 0 24 24" width="18px" fill="#494545"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V9h14v10zm0-12H5V5h14v2zM7 11h5v5H7z"/></svg>
				Published On
			</div>
			<p>${data.datePublish}</p>
		</li>
		<li>
			<div class="xinfo">
				<svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 0 24 24" width="18px" fill="#494545"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/></svg>
				License
			</div>
			<p>${data.license} License</p>
		</li>
		<li>
			<div class="xinfo">
				<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 20 20" height="18px" viewBox="0 0 20 20" width="18px" fill="#494545"><g><rect fill="none" height="20" width="20" x="0"/></g><g><path d="M16.5,6H10L8,4H3.5C2.67,4,2,4.67,2,5.5v9C2,15.33,2.67,16,3.5,16h13c0.83,0,1.5-0.67,1.5-1.5v-7C18,6.67,17.33,6,16.5,6z M3.5,14.5v-9h3.88l2,2h4.12V9H12v1.5h1.5V12H12v1.5h1.5V12H15v-1.5h-1.5V9H15V7.5h1.5v7H3.5z"/></g></svg>
				File Size
			</div>
			<p>${data.filesize}</p>
		</li>
	</ul>
	<a href="${admin_info.download_path + params.id + '.aix?raw=true'}" target="_blank" class="downloadbutton">
		<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="20px" viewBox="0 0 24 24" width="20px" fill="#00947e"><g><rect fill="none" height="24" width="24"/></g><g><path d="M18,15v3H6v-3H4v3c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2v-3H18z M17,11l-1.41-1.41L13,12.17V4h-2v8.17L8.41,9.59L7,11l5,5 L17,11z"/></g></svg>
		Download AIX
	</a>`;


	//compose Blocks
	console.log("Compiling Blocked SVG");
	composeBlockes();
}