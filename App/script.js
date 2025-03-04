let isSignUp = false; // Toggle between Login & Sign Up

// Open the Login Modal
function openLoginModal() {
    document.getElementById("loginModal").style.display = "flex";
}

// Close the Login Modal
function closeLoginModal() {
    document.getElementById("loginModal").style.display = "none";
}

// Toggle Between Login and Sign Up
function toggleAuthMode() {
    isSignUp = !isSignUp;
    document.getElementById("modalTitle").innerText = isSignUp ? "Sign Up" : "Login";
    document.getElementById("toggleText").innerHTML = isSignUp 
        ? 'Already have an account? <span id="toggleLink" onclick="toggleAuthMode()"> Login</span>' 
        : 'Don\'t have an account? <span id="toggleLink" onclick="toggleAuthMode()"> Sign Up</span>';
    
    // Show/Hide Username Field
    document.getElementById("usernameField").classList.toggle("hidden", !isSignUp);
}

// Ensure the modal does NOT show on page load
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("loginModal").style.display = "none";

    // Set max date to today's date for both date inputs
    var today = new Date().toISOString().split('T')[0];  // Get current date in YYYY-MM-DD format
    document.getElementById('start-date').max = today;
    document.getElementById('end-date').max = today;
});

// Add new item (row) to the table
document.getElementById('add-item').addEventListener('click', function() {
    var table = document.getElementById('receipt-table').getElementsByTagName('tbody')[0];
    var newRow = table.insertRow();

    // Add cells for the new row
    newRow.innerHTML = `
        <td><input type="text" value="New Product"></td>
        <td>
            <select>
                <option value="food">Food</option>
                <option value="transport">Transport</option>
                <option value="entertainment">Entertainment</option>
                <option value="other">Other</option>
            </select>
        </td>
        <td><input type="date" value="2025-03-03"></td>
        <td><input type="number" value="0.00" step="0.01"></td>
        <td><button class="remove-item">Remove</button></td>
    `;

    // Add event listener to remove the item
    newRow.querySelector('.remove-item').addEventListener('click', function() {
        newRow.remove();
        updatePieChart();  // Update chart when a row is removed
    });

    // Update pie chart when a new item is added
    updatePieChart();
});

// Remove item functionality - remove the clicked row
document.querySelectorAll('.remove-item').forEach(function(button) {
    button.addEventListener('click', function() {
        var row = button.closest('tr');
        row.remove();
        updatePieChart();
    });
});

// Function to update the pie chart based on current categories and filtered by date range
function updatePieChart() {
    // Get the selected start and end date from the date inputs
    var startDate = document.getElementById('start-date').value;
    var endDate = document.getElementById('end-date').value;
    
    // Get all category data and their corresponding prices
    var categoryAmounts = {
        food: 0,
        transport: 0,
        entertainment: 0,
        other: 0
    };

    var rows = document.querySelectorAll('#receipt-table tbody tr');
    rows.forEach(function(row) {
        var category = row.querySelector('select').value;
        var price = parseFloat(row.querySelector('input[type="number"]').value);
        var date = row.querySelector('input[type="date"]').value;

        // If a date filter is applied, only count entries that fall within the date range
        if ((startDate && new Date(date) < new Date(startDate)) || (endDate && new Date(date) > new Date(endDate))) {
            return; // Skip this row if the date is outside the range
        }

        // Add the price to the correct category
        categoryAmounts[category] += price;
    });

    // If no valid data is found within the range, do not display the chart
    if (categoryAmounts.food + categoryAmounts.transport + categoryAmounts.entertainment + categoryAmounts.other === 0) {
        alert("No items found within the selected date range.");
        return;
    }

    // Remove the existing chart if it exists
    var ctx = document.getElementById('categoryPieChart').getContext('2d');
    if (window.pieChart) {
        window.pieChart.destroy();  // Destroy the previous chart before creating a new one
    }

    // Calculate the total amount spent across all categories
    var totalAmount = categoryAmounts.food + categoryAmounts.transport + categoryAmounts.entertainment + categoryAmounts.other;

    // Create a new pie chart with updated data
    window.pieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Food', 'Transport', 'Entertainment', 'Other'],
            datasets: [{
                data: [categoryAmounts.food, categoryAmounts.transport, categoryAmounts.entertainment, categoryAmounts.other],
                backgroundColor: ['#ff9999', '#66b3ff', '#99ff99', '#ffcc99'],
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        // Calculate percentage of total amount spent per category
                        generateLabels: function(chart) {
                            let data = chart.data;
                            return data.labels.map(function(label, i) {
                                // Calculate percentage based on the total amount spent
                                let percentage = ((data.datasets[0].data[i] / totalAmount) * 100).toFixed(2) + '%';
                                return {
                                    text: label + ': ' + percentage,  // Add percentage next to the label
                                    fillStyle: data.datasets[0].backgroundColor[i],
                                    strokeStyle: data.datasets[0].backgroundColor[i],
                                    lineWidth: 1
                                };
                            });
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        // Show percentage of total amount spent in the tooltip
                        label: function(tooltipItem) {
                            let percentage = ((tooltipItem.raw / totalAmount) * 100).toFixed(2) + '%';
                            return tooltipItem.label + ': $' + tooltipItem.raw.toFixed(2) + ' (' + percentage + ')';
                        }
                    }
                }
            },
            // Pop-out effect when hovering
            animation: {
                animateScale: true,
                animateRotate: true
            }
        }
    });
}

// Add event listener to update chart when clicking "Update Chart" button
document.getElementById('update-chart').addEventListener('click', function() {
    updatePieChart();
});


// Initialize the pie chart with default data
updatePieChart();
