'use strict' 

// --- Inventory Management View Logic (AJAX and Table Building) ---

// Get a list of items in inventory based on the classification_id 
let classificationList = document.querySelector("#classificationList")
let inventoryDisplay = document.querySelector("#inventoryDisplay") 

// Add event listener to react to classification change
if (classificationList && inventoryDisplay) {
    classificationList.addEventListener("change", function () { 
        let classification_id = classificationList.value 
        console.log(`classification_id is: ${classification_id}`) 
        
        // Clear the table before loading new data
        inventoryDisplay.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';

        // Construct the URL for the AJAX request
        let classIdURL = "/inv/getInventory/"+classification_id 
        
        // Fetch the inventory data from the server
        fetch(classIdURL) 
        .then(function (response) { 
            if (response.ok) { 
                return response.json(); 
            } 
            throw Error("Network response was not OK"); 
        }) 
        .then(function (data) { 
            console.log(data); 
            buildInventoryList(data); 
        }) 
        .catch(function (error) { 
            console.log('There was a problem: ', error.message) 
        }) 
    })
}

/* ****************************************
 * Function to build the inventory table HTML
 * This function is used to build the list in the Inventory Management View.
 * *************************************** */
function buildInventoryList(data) {
    const inventoryDisplay = document.querySelector("#inventoryDisplay")
    
    if (!data || data.length === 0) {
        inventoryDisplay.innerHTML = '<tr><td colspan="4">No vehicles found for this classification.</td></tr>';
        return
    }

    // Set up the table header
    let dataTable = '<thead>'
    dataTable += '<tr class="table-header-row">'
    dataTable += '<th class="table-cell">Vehicle Name</th>'
    dataTable += '<th class="table-cell">Price</th>'
    dataTable += '<th class="table-cell">Edit</th>'
    dataTable += '<th class="table-cell">Delete</th>'
    dataTable += '</tr>'
    dataTable += '</thead>'
    
    // Set up the table body
    dataTable += '<tbody>'
    data.forEach(function (element) {
        // Create a row for each item
        dataTable += `<tr class="table-data-row">`
        dataTable += `<td class="table-cell">${element.inv_make} ${element.inv_model}</td>`
        dataTable += `<td class="table-cell">$${new Intl.NumberFormat('en-US').format(element.inv_price)}</td>`
        dataTable += `<td class="table-cell"><a href='/inv/edit/${element.inv_id}' class="action-link edit-link">Edit</a></td>`
        dataTable += `<td class="table-cell"><a href='/inv/delete/${element.inv_id}' class="action-link delete-link">Delete</a></td>`
        dataTable += `</tr>`
    })
    dataTable += '</tbody>'
    
    // Display the new table
    inventoryDisplay.innerHTML = dataTable
}


// --- Edit View Logic (Form Change Listener) ---

// Get the update form and button elements
const form = document.querySelector("#updateForm");
const updateBtn = document.querySelector(".submit-button"); 

// Add a change listener to the update form, if it exists
// This enables the submit button after any form input is changed.
if (form && updateBtn) {
    form.addEventListener("change", function () {
        updateBtn.removeAttribute("disabled");
    });
}
