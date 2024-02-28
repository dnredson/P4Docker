document.addEventListener("DOMContentLoaded", function () {
    var hostRadio = document.getElementById("hostRadio");
    var switchRadio = document.getElementById("switchRadio");
    var hostFields = document.getElementById("hostFields");
    var switchFields = document.getElementById("switchFields");
    var addNodeButton = document.getElementById("addNode"); // Get the Add Node button
    var removeNodeButton = document.getElementById("removeNode");
    var removeEdgeButton = document.getElementById("removeEdge");
    var listNodes = [];
    var listEdges= [];
    var listSwitches = [];
    var listPorts = [];

    var startContainers ="";
    
    // Show host form by default
    hostFields.style.display = "block";
    switchFields.style.display = "none";
 //Alert Function
 function showAlert(message, type) {
    // Create alert div
    var alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
      ${message}
      <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    `;
  
    // Append the alert div to the alert container
    var alertContainer = document.getElementById('alert-container');
    alertContainer.appendChild(alertDiv);
  
    // Remove the alert after some time
    setTimeout(() => {
      $(alertDiv).alert('close');
    }, 5000); // Alert will close after 5 seconds
  }

  
  removeNodeButton.addEventListener('click', function () {
    var selectedNode = cy.$(':selected');
    var connectedEdges = selectedNode.connectedEdges();
    console.log(listPorts)
    if (selectedNode.length > 0) {
      console.log(">0")
      if ( selectedNode.isParent()) {
        console.log(" is Parent")
        var children = selectedNode.children();
        children.forEach(function (child) {
          cy.remove(child);
          child.connectedEdges().forEach(function (edge){
            cy.remove(edge);
            console.log(listPorts)
            listPorts.find(child).remove();
            console.log(listPorts)
          });
        });
      }
      
      cy.remove(connectedEdges);
      cy.remove(selectedNode);
      console.log(listPorts)
      
    
    }else{
        showAlert("No node selected", "danger");
    }
});

// Remove Edge
removeEdgeButton.addEventListener('click', function() {
  var selectedEdge = cy.$('edge:selected');
  if (selectedEdge.length > 0) {
      cy.remove(selectedEdge);
      console.log(selectedEdge);
  } else {
      showAlert("No edge selected", "danger");
  }
});
    // Add event listeners to switch between forms
    hostRadio.addEventListener("change", function () {
        hostFields.style.display = "block";
        switchFields.style.display = "none";
    });

    switchRadio.addEventListener("change", function () {
        hostFields.style.display = "none";
        switchFields.style.display = "block";
    });

    // Event listener to open the nodeModal
    addNodeButton.addEventListener("click", function () {
        $("#nodeModal").modal("show"); // Use jQuery to show the modal
    });
    var numberOfPorts=0;
    //Get data from the form
    function findEmptySpace(cy, newNodeWidth, newNodeHeight) {
        // You may need a more complex algorithm to find an actual empty space
        // This is a placeholder for the logic to find an empty space
        return {
          x: Math.random() * 1000,  // Just an example, replace with your logic
          y: Math.random() * 1000   // Just an example, replace with your logic
        };
      }
    document.getElementById('saveNode').addEventListener('click', function() {
        const isHostSelected = document.getElementById('hostRadio').checked;
        const baseWidthPerPort = 30;
        const portHeight = 20;
        const spacingBetweenPorts = 5;
        const padding = 10;
        const modalData = {};
        
        
        if (isHostSelected) {
            // Capture Host fields
            modalData.type = 'Host';
            modalData.name = document.getElementById('hostName').value;
            modalData.ports = document.getElementById('hostPortas').value;
            modalData.image = document.getElementById('hostImage').value;
            //modalData.off = document.getElementById('hostTCPPOff').checked;
            
            
        } else {
            // Capture Switch fields
            modalData.type = 'Switch';
            modalData.name = document.getElementById('SWhName').value;
            modalData.code = document.getElementById('SWCode').value;
            modalData.apiPorts = document.getElementById('SWAPIports').value;
            modalData.ports = document.getElementById('SWports').value;
            modalData.entries = document.getElementById('SWEntries').value;
           
        }
        numberOfPorts = modalData.ports;
        const totalWidth = modalData.ports * baseWidthPerPort + (modalData.ports - 1) * spacingBetweenPorts + padding * 2;
        
const newPosition = findEmptySpace(cy, totalWidth, portHeight + padding * 2);
        var combinedLabel = "";
        
        if (!cy.getElementById(modalData.name).length) {
         var finalData = {};
          if(modalData.type=='Host'){
            combinedLabel = modalData.name +": "+ modalData.image;
            finalData = { id: modalData.name, name: modalData.name,type: modalData.type, code: modalData.code, label: combinedLabel, image: modalData.image, off: modalData.off }
            
        }
        if(modalData.type=='Switch'){
          var combinedLabel = modalData.name +": "+ modalData.code;
          finalData = { id: modalData.name, name: modalData.name, type: modalData.type, code: modalData.code, label: combinedLabel, apiPorts: modalData.apiPorts, p4code: modalData.code, entries: modalData.entries }
          
        }

          cy.add({
                group: 'nodes',
                data: finalData,
                position: newPosition,
                style: {
                  'width': totalWidth,
                  'height': portHeight + padding * 2
                }
              });
        }
        
        for (let i = 1; i <= modalData.ports; i++) {
            const portId = `${modalData.name}-p${i}`;
            const posX = (i - 1) * (baseWidthPerPort + spacingBetweenPorts) + padding;
            var color = "black";
            if(modalData.type=='Host'){
                color = "blue";
            }
            if(modalData.type=='Switch'){
                color = "green";
            }

            cy.add({
              group: 'nodes',
              data: { id: portId, name: portId, parent: modalData.name, ip: "", mac:"",type:"Port" },
              position: { x: posX, y: padding + portHeight / 2 },
              style: {
                
                'shape': 'rectangle',
                'background-image': 'url(./assets/images/port.png)', // Replace with the path to your image
                'background-fit': 'cover', // Options are 'none', 'contain', and 'cover'
                 'background-clip': 'node',
                 'background-opacity':'0.3',
                 'color':color
    
              }
            });
          }
       
        
  cy.style(cyStyle).update(); // Update the style
  cy.layout({ name: 'preset' }).run(); // Apply preset layout to use calculated positions
  cy.zoom(1.3); // Adjust to your preferred default zoom level
  cy.center();
  $('#nodeModal').modal('hide');
       
    });



    //Configure Cytoscape


// Set the style
const cyStyle = [
    // Styles for the parent node (switch body)
    {
        selector: 'node',
        style: {
          'label': 'data(name)', // Assuming you want to display the id
          'color': '#000', // Text color
          'font-size': 10, // Font size for text
          'text-valign': 'center', // Vertical alignment of text
          'text-halign': 'center', // Horizontal alignment of text
          'text-events': 'yes' // Ensure text is not placed behind the node shape
        }
    },
    //Styles for the parent
    {
      selector: 'node:parent',
      style: {
        'label': 'data(name)',
        'shape': 'roundrectangle',
        'background-color': '#2ECC40',
        'background-opacity': 0.3,
        'border-color': '#2980B9',
        'border-width': 2,
        'text-valign': 'top',
        'padding-top': '10px',
        'padding-left': '10px',
        'padding-bottom': '10px',
        'padding-right': '10px',
              
      }
    },
    {
      selector: '$node > node', // Seletor para nós filhos
      style: {
          // ... outros estilos para nós filhos ...
         // 'background-image': 'url(./assets/images/port.png)',
          //'background-fit': 'cover',
          // ... outros estilos ...
      }
  },
    {
      selector: 'node:children',
      style: {
        'shape': 'rectangle',
          'background-image': 'url(./assets/images/port.png)', // Replace with the path to your image
          'background-fit': 'cover', // Options are 'none', 'contain', and 'cover'
           'background-clip': 'node',
           'background-opacity':'0.3',
              
      }
    },
    {
      selector: 'node:child',
      style: {
        'shape': 'rectangle',
          'background-image': 'url(./assets/images/port.png)', // Replace with the path to your image
          'background-fit': 'cover', // Options are 'none', 'contain', and 'cover'
           'background-clip': 'node',
           'background-opacity':'0.3',
              
      }
    },
    //style for the switch code
    
    // Styles for child nodes (ports)
    {
      selector: '$node > node',
      style: {
        'label': 'data(name)',
        'shape': 'roundrectangle',
        'background-color': '#666',
        'border-color': '#333',
        'border-width': 2,
        'width': '20px',
        'height': '20px',
        'text-margin-y': '0px',
        'text-valign': 'top',
        'text-halign': 'center',
        //'background-image': 'url(./assets/images/port.png)', // Replace with the path to your image
        //'background-fit': 'cover', // Options are 'none', 'contain', and 'cover'
       
      }
    },
    {
        selector: 'node[type = "Host"]',
        style: {
          'label': 'data(label)',
          'border-color': 'blue',
          // ... (other styles for Host nodes) ...
        }
      },
      {
        selector: 'node[type = "Port"]',
        style: {
          'shape': 'rectangle',
          'background-image': 'url(./assets/images/port.png)', // Replace with the path to your image
          'background-fit': 'cover', // Options are 'none', 'contain', and 'cover'
           'background-clip': 'node',
           'background-opacity':'0.3',
          // other styles for Host nodes
        }
      },
      // Style for 'Switch' nodes
      {
        selector: 'node[type = "Switch"]',
        style: {
          'label': 'data(label)',
          'border-color': 'green',

          // ... (other styles for Switch nodes) ...
        }
      },
    
      // Style for selected nodes
      {
        selector: 'node:selected',
        style: {
          'border-color': 'red',
          // ... (other styles for selected nodes) ...
        }
      },
    // Styles for edges (if necessary)
    {
      selector: 'edge',
      style: {
        'width': 2,
        'line-color': 'red',
        'target-arrow-color': 'red',
        'target-arrow-shape': 'triangle'
      }
    },
   
  ];
  
  // Set the style

  

    var cy = cytoscape({
        container: document.getElementById('cy'), // container to render in
      
        elements: [
          // list of initial elements (nodes and edges)
        ],
      
        style: [ // the stylesheet for the graph
          {
            selector: 'node',
            style: {
              
            }
          },
          {
            selector: 'edge',
            style: {
              'width': 1,
              'line-color': 'red',
              'target-arrow-color': 'red',
              'target-arrow-shape': 'triangle'
            }
          },
          {
            selector: 'node[type = "Port"]',
            style: {
              'shape': 'rectangle',
              'background-image': 'url(./assets/images/port.png)', // Replace with the path to your image
              'background-fit': 'cover', // Options are 'none', 'contain', and 'cover'
               'background-clip': 'node',
               'background-opacity':'0.3',
              // other styles for Host nodes
            }
          },
          {
            selector: 'node[type = "Host"]',
            style: {
              'border-color': 'blue',
              // other styles for Host nodes
            }
          },
        
          // Style for 'Switch' nodes
          {
            selector: 'node[type = "Switch"]',
            style: {
              'border-color': 'green',
              // other styles for Switch nodes
            }
          },
        
          // Style for selected nodes
          {
            selector: 'node:selected',
            style: {
              'border-color': 'red',
              // other styles for selected nodes
            }
          },
        ],
      
        layout: {
          name: 'grid',


          
        },

        zoom: 0.8, // Adjust this value as needed

        // Set zooming options
        minZoom: 0.3,
        maxZoom: 5,
        zoomingEnabled: true,
        userZoomingEnabled: true
      });
      
      

      cy.style(cyStyle);
     
     
      
  cy.on('render pan zoom', function() {
    var base64 = cy.png({
      full: true,
      scale: 1 //if i use here core.zoom() than there is no bug with shadows on bird view
    });
    $('#bird-view').prop('src', base64);
  });

  function addChildNodeToSelectedParent() {
    var selectedParent = cy.$(':selected'); // assumes single selection
    if (selectedParent.length > 0 && selectedParent.isParent()) {
      var parentId = selectedParent.id();
      var children = selectedParent.children();
      var parentType = selectedParent.data('type');
      var nextChildId = `${parentId}-p${children.length + 1}`;
      var lastChild = children[children.length - 1]; 
      var positionX = (lastChild ? lastChild.position('x') + lastChild.outerWidth() : selectedParent.position('x'))+5;
    var positionY = lastChild ? lastChild.position('y') : selectedParent.position('y');
    
        var color = "black";
        if(parentType==="Host"){
            color="blue"
        }
        if(parentType==="Switch"){
            color="green"
        }
      cy.add({
        group: 'nodes',
        data: { id: nextChildId, parent: parentId,name: nextChildId,  ip: "", mac:"", type:"Port" },
        position: { x: positionX, y: positionY } ,
        style: {
                
            'shape': 'rectangle',
            'background-image': 'url(./assets/images/port.png)', // Replace with the path to your image
'background-fit': 'cover', // Options are 'none', 'contain', and 'cover'
'background-clip': 'node',
'background-opacity':'0.3',
'color': color

          }
      });
      if (selectedParent.isParent() && selectedParent.data('type') === 'Switch') {
        // Update the 'code' data for the parent node if necessary
        selectedParent.data('code', document.getElementById('SWCode').value);
    }
      cy.layout({ name: 'preset' }).run(); // Re-run layout to position new node
    } else {
        showAlert('No parent node selected or selected node is not a valid node.', 'danger');
      
    }
  }
  
  // Add this line in your DOMContentLoaded event listener to bind the function to your button
  document.getElementById('addChildNodeButton').addEventListener('click', addChildNodeToSelectedParent);
  

  //Editar o node switch
  // For Switch
  cy.on('select unselect', function(event) {
    var selectedNodes = cy.$('node:selected');
    var editNodeButton = document.getElementById('editNodeButton');
    
    if (selectedNodes.length === 1 && selectedNodes.isParent()) {
      // Enable button if one parent node is selected
      editNodeButton.disabled = false;
    } else {
      // Disable button otherwise
      editNodeButton.disabled = true;
    }
  });
  document.getElementById('editNodeButton').addEventListener('click', function() {
    var selectedNode = cy.$('node:selected');
  
    // Check if a parent node is selected
    if (selectedNode.isParent()) {
      if (selectedNode.data('type') === 'Switch') {
        // Set values in the Switch modal inputs
        document.getElementById('switchNameInput').value = selectedNode.data('name') || '';
        document.getElementById('switchAPIPortInput').value = selectedNode.data('apiPorts') || '';
        document.getElementById('switchCodeNameInput').value = selectedNode.data('code') || '';
        document.getElementById('switchEntriesInput').value = selectedNode.data('entries') || '';
        
        // Show the Switch modal
        $('#editSwitchModal').modal('show');
      } else if (selectedNode.data('type') === 'Host') {
        // Set values in the Host modal inputs
        document.getElementById('hostNameInput').value = selectedNode.data('name') || '';
        document.getElementById('hostImageInput').value = selectedNode.data('image') || '';
        //document.getElementById('hostTCPPOffInput').checked = selectedNode.data('off') || '';
        
        // Show the Host modal
        $('#editHostModal').modal('show');
      } else {
        // Show an error if the selected node is not a Switch or Host
        showAlert('Selected node is not a Switch or Host.', 'warning');
      }
    } else {
      // Show an error if no node is selected
      showAlert('Please select a node to edit.', 'warning');
    }
  });
  
  document.getElementById('saveSwitchChanges').addEventListener('click', function() {
    var selectedNode = cy.$('node:selected[type="Switch"]');
    var name = document.getElementById('switchNameInput').value;
    var apiPorts = document.getElementById('switchAPIPortInput').value;
    var code = document.getElementById('switchCodeNameInput').value;
    var entries = document.getElementById('switchEntriesInput').value;
     var combinedLabel = name +": "+ code;
    selectedNode.data({
      
      'name': name,
      'apiPorts': apiPorts,
      'code': code,
      'label': combinedLabel,
      'entries': entries
    });
    

   
    cy.style(cyStyle).update();
    $('#editSwitchModal').modal('hide');
    displayNodeInfo(selectedNode);
    cy.zoom(1.3); // Adjust to your preferred default zoom level
cy.center();
  });

  document.getElementById('saveHostChanges').addEventListener('click', function() {
    var selectedNode = cy.$('node:selected[type="Host"]');
    var name = document.getElementById('hostNameInput').value;
    var image = document.getElementById('hostImageInput').value;
    //var off = document.getElementById('hostTCPPOffInput').checked;
    
     var combinedLabel = name +": "+ image;
    selectedNode.data({
      'name': name,
      'image': image,
      'label': combinedLabel,
      'off': off
    });
    
    cy.style(cyStyle).update();
    $('#editHostModal').modal('hide');
    displayNodeInfo(selectedNode);
    cy.zoom(1.3); // Adjust to your preferred default zoom level
cy.center();
  });
  

  //Criar edges
  document.getElementById('addEdge').addEventListener('click', function() {
    populateParentDropdowns();
    $('#addEdgeModal').modal('show');
  });
  function populateParentDropdowns() {
    var sourceParentDropdown = document.getElementById('sourceParentDropdown');
    var targetParentDropdown = document.getElementById('targetParentDropdown');
  
    // Clear existing options
    sourceParentDropdown.innerHTML = '';
    targetParentDropdown.innerHTML = '';
  
    var parents = cy.nodes().filter(function(node) {
      return node.isParent();
    });
  
    parents.forEach(function(parent) {
      var option = new Option(parent.data('name'), parent.id());
      sourceParentDropdown.add(option.cloneNode(true));
      targetParentDropdown.add(option);
    });
  
    // Adicione event listeners para mudanças no parent dropdown
    sourceParentDropdown.addEventListener('change', function() {
      populateChildDropdown(this.value, 'sourceChildDropdown');
    });
    targetParentDropdown.addEventListener('change', function() {
      populateChildDropdown(this.value, 'targetChildDropdown');
    });

    // Carrega os dropdowns de filhos com base na seleção inicial dos pais
    if (parents.length > 0) {
        populateChildDropdown(parents[0].id(), 'sourceChildDropdown');
        populateChildDropdown(parents[0].id(), 'targetChildDropdown');
    }
}

  
  
  function populateChildDropdown(parentId, childDropdownId) {
    var children = cy.getElementById(parentId).children();
    var childDropdown = document.getElementById(childDropdownId);
    childDropdown.innerHTML = ''; // Clear existing options
  
    children.forEach(function(child) {
      var option = new Option(child.data('id'), child.id());
      childDropdown.add(option);
    });
  }
  
  document.getElementById('saveEdge').addEventListener('click', function() {
    var sourceChildId = document.getElementById('sourceChildDropdown').value;
    var targetChildId = document.getElementById('targetChildDropdown').value;
    var sourceIp = document.getElementById('sourceIp').value;
    var sourceMac = document.getElementById('sourceMac').value;
    var targetIp = document.getElementById('targetIp').value;
    var targetMac = document.getElementById('targetMac').value;
  
    // Create the edge
    cy.add({
      group: 'edges',
      data: { source: sourceChildId, target: targetChildId }
    });
  
    // Update the IP and MAC addresses of the source and target nodes
    cy.getElementById(sourceChildId).data({ 'ip': sourceIp, 'mac': sourceMac });
    cy.getElementById(targetChildId).data({ 'ip': targetIp, 'mac': targetMac });
  
    // Refresh the view and close the modal
    cy.style(cyStyle).update();
    $('#addEdgeModal').modal('hide');
  });
  
//Zoom
document.getElementById('zoomInButton').addEventListener('click', function() {
  cy.zoom(cy.zoom() * 1.1); // Zoom in by 10%
  cy.center(); // Keep the graph centered
});

document.getElementById('zoomOutButton').addEventListener('click', function() {
  cy.zoom(cy.zoom() * 0.9); // Zoom out by 10%
  cy.center(); // Keep the graph centered
});


//Show content on the info-box
cy.on('select', 'node', function(event) {
  var node = event.target;
  displayNodeInfo(node);
});

function displayNodeInfo(node) {
  var infoBox = document.getElementById('info-box');
  var htmlContent = '';

  if (node.isParent()) {
    // For parent nodes (Host or Switch)
    var type = node.data('type');
    var children = node.children();
    var childrenInfo = children.map(child => {
      return `Id: ${child.data('name')} <br> IP: ${child.data('ip')}<br> MAC: ${child.data('mac')}`;
    }).join('<br>');

    if (type === 'Host') {
      htmlContent = `<div class="infoTable"><div class="bg-blue"> ${node.data('name')}</div><div class="rowInfo"> Image: ${node.data('image')}</div><div class="rowInfo">Ports: <br> ${childrenInfo}</div></div>`;
    } else if (type === 'Switch') {
      htmlContent = `<div class="infoTable"><div class="bg-green"> ${node.data('name')}</div><div class="rowInfo">P4 Code: ${node.data('p4code')}</div><div class="rowInfo">Entries: ${node.data('entries')}</div><div class="rowInfo">API Ports: ${node.data('apiPorts')}</div><div class="rowInfo">${childrenInfo}</div></div></div></div`;
    }
  } else {
    // For child nodes
    var parentId = node.parent().data('id');
    
    var connectedEdges = node.connectedEdges().map(edge => edge.id()).join(', ');
    var edge = cy.getElementById(connectedEdges);
    var sourceNode = edge.data('source');
    var targetNode = edge.data('target');
    var sourceNodeData = cy.getElementById(sourceNode).data();
var targetNodeData = cy.getElementById(targetNode).data();
    
    if (sourceNode ==undefined){
      sourceNode = "Not defined";
    }
    if (targetNode ==undefined){
      targetNode= "Not defined";
    }
    htmlContent = `<div class="bg-red"> ${node.data('id')}</div><div class="rowInfo"> Parent: ${parentId}</div><div class="rowInfo"> Edges: ${sourceNode} to ${sourceNode}</div><div class="rowInfo"> IP: ${node.data('ip')}</div><div class="rowInfo"> MAC: ${node.data('mac')}</div>`;
    
  }

  infoBox.innerHTML = htmlContent;
}

//Import and export functions

// Function to export the topology to JSON
// Function to export topology
function exportTopology() {
  var exportJson = cy.json();
  document.getElementById('exportedJson').value = JSON.stringify(exportJson, null, 2);
  $('#exportTopologyModal').modal('show');
}

// Event listener for the export button
document.getElementById('exportTopology').addEventListener('click', exportTopology);

// Function to copy to clipboard
document.getElementById('copyToClipboard').addEventListener('click', function() {
  var copyText = document.getElementById('exportedJson');
  copyText.select();
  document.execCommand('copy');
});

// Function to download JSON
document.getElementById('downloadJson').addEventListener('click', function() {
  var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(cy.json(), null, 2));
  var downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href",     dataStr);
  downloadAnchorNode.setAttribute("download", "topology.json");
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
});


//Import
// Event listener for the import button
document.getElementById('importTopology').addEventListener('click', function() {
  $('#importTopologyModal').modal('show');
});

// Function to handle file reader and update the cytoscape instance
document.getElementById('importJson').addEventListener('click', function() {
  var importedJson = document.getElementById('importedJson').value;
  if (importedJson) {
    cy.json(JSON.parse(importedJson));
    cy.nodes().forEach(node => {
      if (node.data('type') === 'Port') {
          node.style('background-image', 'url(./assets/images/port.png)');
          node.style('background-fit', 'cover');
          node.style('shape', 'rectangle');
          node.style('background-opacity', '0.3');
          node.style('background-clip', 'node');
          
          

      }
  });
  } else {
    var file = document.getElementById('importJsonFile').files[0];
    var reader = new FileReader();
    reader.onload = function(e) {
      var fileContents = e.target.result;
      
      cy.json(JSON.parse(fileContents));
      cy.nodes().forEach(node => {
        if (node.data('type') === 'Port') {
            node.style('background-image', 'url(./assets/images/port.png)');
            node.style('background-fit', 'cover');
            node.style('shape', 'rectangle');
            node.style('background-opacity', '0.3');
            node.style('background-clip', 'node');
        }
    });
    };
    reader.readAsText(file);
   
  }
  cy.style(cyStyle).update();
  $('#importTopologyModal').modal('hide');
});


//botão para gerar c´odigo
function displayCyData() {
  var nodes = cy.nodes().map(node => ({
    data: node.data(),
    position: node.position()
  }));

  var edges = cy.edges().map(edge => edge.data());

  var cyData = {
    nodes: nodes,
    edges: edges
  };
  console.log("Data");
  console.log(nodes);
  console.log("Edge");
  console.log(edges);
  //Inicia o arquivo
 
  startContainers =  "";
  startContainers = startContainers +"#!/bin/bash \n";
  // Carrega as informações e inicia os containers docker
  nodes.forEach(function(node) {
    console.log("Tipo do node: "+node)
    if(node["data"]["type"] == "Host"){
      startContainers = startContainers+'\n \n echo "Start Host Container '+ node["data"]["name"]  +'" \n '; 
      var docker= 'docker run -itd --name '+ node["data"]["name"] +' --network="none" --privileged -v shared:/codes --workdir /codes '+ node["data"]["image"];
      startContainers = startContainers + docker +"\n";
      listNodes.push({name: node["data"]["name"], off:node["data"]["off"],pid: "" });
      startContainers = startContainers +' alias '+node["data"]["name"]+'="docker exec -it '+node["data"]["name"]+ ' /bin/bash" \n';
    
    
    
    }


    if(node["data"]["type"] == "Switch"){
      startContainers = startContainers+' \n \n echo "Start Switch Container '+ node["data"]["name"]  +'" \n '; 
      var docker= 'docker run -itd --name '+ node["data"]["name"] +' --network="none" --privileged -v shared:/codes  --workdir /codes dnredson/p4d';
      startContainers = startContainers + docker +"\n";
      startContainers = startContainers +' alias '+node["data"]["name"]+'="docker exec -it '+node["data"]["name"]+ ' /bin/bash" \n';
      startContainers = startContainers +' alias log'+node["data"]["name"]+'="docker exec -it '+node["data"]["name"]+ ' cat /tmp/switch.log" \n';
      listSwitches.push({name: node["data"]["name"], code: node["data"]["code"], port: node["data"]["apiPorts"], entries: node["data"]["entries"], pid:"" })
    
      startContainers = startContainers +node["data"]["name"]+"() { \n";
      startContainers = startContainers +"docker exec -it "+node["data"]["name"]+" /bin/bash \n";
      startContainers = startContainers +"} \n";
      startContainers = startContainers +"export -f "+node["data"]["name"] + "\n";

      startContainers = startContainers +"log"+node["data"]["name"]+"() { \n";
      startContainers = startContainers +"docker exec -it "+node["data"]["name"]+" cat /tmp/switch.log \n";
      startContainers = startContainers +"} \n";
      startContainers = startContainers +"export -f log"+node["data"]["name"];
      
    
    }
    if(node["data"]["parent"] != null){
     
      listPorts.push(node);
     
     
    }
 
  });
  
     
    //Variáveis com os PIDs de cada elemento
    startContainers = startContainers+' \n \n echo "Capturando o PID de cada container para adicionar ao namespace"\n '; 
     listNodes.forEach(function(node) {
      startContainers = startContainers + "PID"+node.name +"=$(docker inspect -f '{{.State.Pid}}' "+node.name+") \n";

     });
    
     listSwitches.forEach(function(node) {
      startContainers = startContainers + "PID"+node.name +"=$(docker inspect -f '{{.State.Pid}}' "+node.name+") \n";

     });


     // Cria os VETH peers
     startContainers = startContainers+'\n \n echo "Crianco VETH Peers"\n '; 
      edges.forEach(function(edge) {
      startContainers = startContainers + "sudo ip link add "+ edge["source"]+"-"+edge["target"]+" type veth peer name "+ edge["target"]+"-"+edge["source"] +" \n";
    });
    startContainers = startContainers+'\n \n echo "Configurando os Namespaces" \n '; 
    // Cria os namespaces e atribui para cada container
    edges.forEach(function(edge) {
      var firstHost = edge["source"].split('-')[0];
      var secondHost = edge["target"].split('-')[0];
      var portNameFirstHost = edge["source"]+"-"+edge["target"];
      var portNameSecondHost = edge["target"]+"-"+edge["source"];
      var configSource ;
      var configTarget;
      startContainers = startContainers + "sudo ip link set "+ portNameFirstHost+" netns $PID"+firstHost +" \n" ;
      startContainers = startContainers + "sudo ip link set "+ portNameSecondHost+" netns $PID"+ secondHost+" \n" ;
      
    });
    // Configura as interfaces de rede
    startContainers = startContainers+'\n \n echo "Configurando interfaces de rede" \n '; 
    edges.forEach(function(edge) {
      var firstHost = edge["source"].split('-')[0];
      var secondHost = edge["target"].split('-')[0];
      var portNameFirstHost = edge["source"]+"-"+edge["target"];
      var portNameSecondHost = edge["target"]+"-"+edge["source"];
      var configSource ;
      var configTarget;
     
     listPorts.forEach(function(port) {
        if(port["data"].name == edge["source"]){
      
          configSource = port.data;
          startContainers = startContainers + "sudo nsenter -t $PID"+firstHost+" -n ip addr add " + configSource.ip + " dev " +portNameFirstHost + " \n";
          startContainers = startContainers + "sudo nsenter -t $PID"+firstHost+" -n ip link set dev "+portNameFirstHost +" address " + configSource.mac + " \n";
          startContainers = startContainers + "sudo nsenter -t $PID"+firstHost+" -n ip link set "+portNameFirstHost +" up \n";
          
          //sudo nsenter -t $PIDSW1 -n ip link set veth1 up
        }
        if(port["data"].name == edge["target"]){
          
          configSource = port.data;
          startContainers = startContainers + "sudo nsenter -t $PID"+secondHost+" -n ip addr add " + configSource.ip + " dev " +portNameSecondHost + " \n";
          startContainers = startContainers + "sudo nsenter -t $PID"+secondHost+" -n ip link set dev "+portNameSecondHost +" address " + configSource.mac + " \n";
          startContainers = startContainers + "sudo nsenter -t $PID"+secondHost+" -n ip link set "+portNameSecondHost +" up \n";
        }
        
      
    

      
     } );
     
      


    });
    //Configura o modo promíscuo nas placas de rede
    edges.forEach(function(edge) {
      var firstHost = edge["source"].split('-')[0];
      var secondHost = edge["target"].split('-')[0];
      var portNameFirstHost = edge["source"]+"-"+edge["target"];
      var portNameSecondHost = edge["target"]+"-"+edge["source"];
      
      startContainers = startContainers + "docker exec "+firstHost+" ip link set " + portNameFirstHost +" promisc on \n"
      startContainers = startContainers + "docker exec "+secondHost+" ip link set " + portNameSecondHost +" promisc on \n"

      
    });
    // Configura caso haja TCP Offloading ativo
    /* startContainers = startContainers+'\n \n echo "Checando se há TCP Offloading ativo" \n '; 
    listNodes.forEach(function(node) {
       
      if(node.off){
        listPorts.forEach(function(port) {
          if(port["data"].parent == node.name){
            
            startContainers = startContainers + "docker exec "+ node.name +" ethtool -K "+ port["data"].name + "tx off tx off \n";
          }
        });
      
      }
      
    }); */
    //Configurar as rotas no switch para utilizarem o switch na mesma rede como gateway
    startContainers = startContainers+'\n \n echo "Configurando Rota Padrão nos hosts (Valide no código suas rotas desejadas) " \n '; 
    startContainers = startContainers+'\n \n echo "Por padrão, o código irá configurar o gateway de um host como a porta do switch ao qual está conectado" \n '; 
    startContainers = startContainers + "# Por padrão, o código irá configurar o gateway de um host como a porta do switch ao qual está conectado \n"
    startContainers = startContainers + "# Altere estas linhas pare definir suas rotas da maneira que desejar \n"
    edges.forEach(function(edge) {
      var firstHost = edge["source"].split('-')[0];
      var secondHost = edge["target"].split('-')[0];
      var portNameFirstHost = edge["source"]+"-"+edge["target"];
      var portNameSecondHost = edge["target"]+"-"+edge["source"];

      listPorts.forEach(function(portSource) {
        listNodes.forEach(function(node) {
          
            if(portSource["data"].parent == node["name"]){
              if(portSource["data"].name == edge["source"]){
                listPorts.forEach(function(portTarget) {
          
                  if(portTarget["data"].name == edge["target"]){
                    
                    startContainers = startContainers +"docker exec "+ portSource["data"].parent +" route add default gw "+ portTarget["data"].ip.split('/')[0]+" \n";
                  }
                });  
                
              }
            }
        });
       
      });  
            
    });
    
    //Iniciar o BMV2 em cada switch
    listSwitches.forEach(function(sw){
        
        orderPorts = [];
        listPorts.forEach(function(port){
        
          
            if (sw.name == port["data"].parent ){
              orderPorts.push(port)
            }
        });
        orderPorts.sort((a, b) => a.position.x - b.position.x);
        var switchPorts = [];
        
       orderPorts.forEach(function(port){
        edges.forEach(function(edge){
          var id = cy.getElementById(edge.id);
          var source =id.source();
          var target = id.target();
          if(port["data"].name == source["_private"]["data"].name){
          switchPorts.push(source["_private"]["data"].name+"-"+target["_private"]["data"].name)
          }
          if(port["data"].name == target["_private"]["data"].name){
            switchPorts.push(target["_private"]["data"].name+"-"+source["_private"]["data"].name)
            }
                    
        });
      });
      var newPorts = [];
      var switches2 = cy.elements('node[type="Switch"]');
      console.log("Começando captura")
      switches2.forEach(function(sw) {
          console.log('Switch:', sw.id());
          
          var childNodes = sw.descendants();

          // Ordena os nós filhos com base na posição x
          childNodes = childNodes.sort((a, b) => a.position().x - b.position().x);
  
          
          childNodes.forEach(function(childNode) {
              var connectedEdges = cy.edges(`[source = "${childNode.id()}"], [target = "${childNode.id()}"]`);

              console.log("Child Node name")
              console.log(childNode["_private"]["data"].name)    
              if(connectedEdges.length >0){
                if(childNode["_private"]["data"].name == connectedEdges[0]["_private"]["data"]["source"]){
                  newPorts.push ( connectedEdges[0]["_private"]["data"]["source"]+"-"+ connectedEdges[0]["_private"]["data"]["target"])
                }
                if(childNode["_private"]["data"].name == connectedEdges[0]["_private"]["data"]["target"]){
                  newPorts.push ( connectedEdges[0]["_private"]["data"]["target"]+"-"+ connectedEdges[0]["_private"]["data"]["source"])
                }
              }
              
              //console.log(connectedEdges[0]["_private"]["data"]["source"])
              
          });
      });
      
        var portsConfig = "";
        newPorts.forEach(function(port,index){
          var i = parseInt(index);
          i = i +1;
          portsConfig = portsConfig +" -i "+ i+ "@" + port;
        });
        
        startContainers = startContainers + "docker exec "+sw.name +" sh -c 'echo 0 >> /proc/sys/net/ipv4/ip_forward' \n";

        startContainers = startContainers +"docker exec "+sw.name +" sh -c 'nohup simple_switch  --thrift-port "+sw.port+" "+portsConfig+" "+sw.code +" --log-console >> /tmp/switch.log &' \n";
        
        sw.entries.split(";").forEach(function(command){
        if(command !=""){
          
        
        if (command.length > 3){
          startContainers = startContainers +`docker exec ${sw.name} sh -c 'echo "${command}" | simple_switch_CLI --thrift-port ${sw.port}'  \n`; 
        }
        
        }
        });
    });

    //docker exec sw1 sh -c 'nohup simple_switch  --thrift-port 50001 -i 1@veth1 -i 2@veth3  standard.json &'


    //docker exec sw1 sh -c 'simple_switch  --thrift-port 50001 -i 1@veth1 -i 2@veth3  standard.json --log-console >> /tmp/bmv2.log &'
    
    //Adiciona regras via API do BMv2
    //docker exec sw1 sh -c 'echo "table_add MyIngress.ipv4_lpm ipv4_forward 10.0.1.2  => 00:00:00:00:01:02 1" | simple_switch_CLI --thrift-port 50001'
    //docker exec sw1 sh -c 'echo "table_add MyIngress.ipv4_lpm ipv4_forward 10.0.2.2 =>  00:00:00:00:02:02 2" | simple_switch_CLI --thrift-port 50001'
    
  
  document.getElementById('cyDataTextarea').value = startContainers;
  $('#dataDisplayModal').modal('show');

}



document.getElementById('generateCode').addEventListener('click', displayCyData);

// code to download 
document.getElementById('copyToClipboardButton').addEventListener('click', function() {
  const textArea = document.getElementById('cyDataTextarea');
  textArea.select();
  document.execCommand('copy');
});

document.getElementById('downloadButton').addEventListener('click', function() {
  const text = document.getElementById('cyDataTextarea').value;
  const blob = new Blob([text], { type: 'text/plain' });
  const anchor = document.createElement('a');
  anchor.download = 'topology.sh';
  anchor.href = window.URL.createObjectURL(blob);
  anchor.click();
  window.URL.revokeObjectURL(anchor.href);
});


function displayDeleteCode (){
  let edges = cy.edges().map(edge => edge.data());
  let nodes = cy.nodes().map(node => node.data());
  var container = "";
  console.log(nodes);
  nodes.forEach(function (node){
    if(node.type == "Switch" || node.type == "Host"){
      container = container + ' "'+node.name+'" ';
    }
    
  });
  var interfaces="";
  
  edges.forEach(function (edge){
    console.log(edge);
    interfaces = interfaces+ ' "'+edge.source+'-'+edge.target+'" ';
    interfaces = interfaces+ ' "'+edge.target+'-'+edge.source+'" ';
    
    
  });
  var scriptLimpeza = '#!/bin/bash \n';
  scriptLimpeza = scriptLimpeza+"# Stop and remove containers \n";
  scriptLimpeza = scriptLimpeza+'containers=($'+container +') \n';
  scriptLimpeza = scriptLimpeza+'for container in "${containers[@]}"; do \n';
  scriptLimpeza = scriptLimpeza+ 'if [ $(docker ps -a -q -f name=^/${container}$) ]; then \n';
  scriptLimpeza = scriptLimpeza+'echo "Removing container $container..." \n';
  scriptLimpeza = scriptLimpeza+'docker stop $container \n';
  scriptLimpeza = scriptLimpeza+'docker rm $container \n';
  scriptLimpeza = scriptLimpeza+'    fi \n';
  scriptLimpeza = scriptLimpeza+ 'done \n \n';

  scriptLimpeza = scriptLimpeza+"# Removing Interfaces \n";
  scriptLimpeza = scriptLimpeza+"veths=( "+interfaces +") \n";
  scriptLimpeza = scriptLimpeza+'for veth in "${veths[@]}"; do \n';
  scriptLimpeza = scriptLimpeza+'echo "Removing interface $veth..." \n'
  scriptLimpeza = scriptLimpeza+"    if ip link show | grep -q $veth; then \n";
  scriptLimpeza = scriptLimpeza+'        sudo ip link delete $veth \n';
  scriptLimpeza = scriptLimpeza+'        sudo ip link del $veth 2>/dev/null \n';
  scriptLimpeza = scriptLimpeza+"    fi \n";
  scriptLimpeza = scriptLimpeza+"done \n";  
  scriptLimpeza = scriptLimpeza+'echo "Environment Cleaned!'
  


  document.getElementById('deleteData').value = scriptLimpeza;
  $('#dataDeleteModal').modal('show');
}

document.getElementById('deleteCodeButton').addEventListener('click', displayDeleteCode);


// code to download 
document.getElementById('copyDeleteToClipboardButton').addEventListener('click', function() {
  const textArea = document.getElementById('deleteData');
  textArea.select();
  document.execCommand('copy');
});

document.getElementById('downloadDeleteButton').addEventListener('click', function() {
  const text = document.getElementById('deleteData').value;
  const blob = new Blob([text], { type: 'text/plain' });
  const anchor = document.createElement('a');
  anchor.download = 'cleanTopology.sh';
  anchor.href = window.URL.createObjectURL(blob);
  anchor.click();
  window.URL.revokeObjectURL(anchor.href);
});


//Form Validation

  // Event listener para o botão "Save changes" do formulário de edição de host
  document.getElementById('saveHostChanges').addEventListener('click', function(event) {
      if (!validateForm('editHostForm')) {
          event.preventDefault(); // Impede o envio do formulário
          showAlert('Todos os campos obrigatórios devem ser preenchidos.', 'warning');
      }
  });

  // Event listener para o botão "Save changes" do formulário de adição de edge
  document.getElementById('saveEdge').addEventListener('click', function(event) {
      if (!validateForm('addEdgeForm')) {
          event.preventDefault(); // Impede o envio do formulário
          showAlert('Todos os campos obrigatórios devem ser preenchidos.', 'warning');
      }
  });

  // Outros event listeners para os demais botões "Save changes" podem ser adicionados aqui


  // Event listener para o botão "Save changes" do formulário de adição de edge
  document.getElementById('saveNode').addEventListener('click', function(event) {
    if (!validateForm('nodeForm')) {
        event.preventDefault(); // Impede o envio do formulário
        showAlert('Todos os campos devem ser preenchidos.', 'warning');
    }
});

// Outros event listeners para os demais botões "Save changes" podem ser adicionados aqui

// Função para validar um formulário específico
function validateForm(formId) {
  var form = document.getElementById(formId);
  var requiredFields = form.querySelectorAll('input[required], select[required], textarea[required]');
  for (var field of requiredFields) {
      if (!field.value) {
          return false;
      }
  }
  return true;
}

});







