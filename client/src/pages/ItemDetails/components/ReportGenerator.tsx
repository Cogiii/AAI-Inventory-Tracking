// API response type - matches what the backend returns
interface ApiInventoryItem {
  id: number;
  type: 'product' | 'material';
  brand_id: number | null;
  brand_name: string | null;
  name: string;
  description: string | null;
  delivered_quantity: number;
  damaged_quantity: number;
  lost_quantity: number;
  available_quantity: number;
  warehouse_location_id: number | null;
  warehouse_location_name: string | null;
  status: string | null;
  created_at: string;
  updated_at: string;
}

interface ActivityItem {
  id: number
  action: string
  description: string
  user: string
  timestamp: string
}

interface ReportGeneratorProps {
  item: ApiInventoryItem
  activities: ActivityItem[]
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

const ReportGenerator = ({ item, activities, onSuccess, onError }: ReportGeneratorProps) => {
  
  const generateItemReportCSV = (reportData: any) => {
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    return `ITEM DETAILED REPORT
Generated on: ${formatDate(reportData.reportGeneratedAt)}

=== BASIC INFORMATION ===
Item ID,${reportData.itemId}
Item Name,${reportData.itemName}
Item Type,${reportData.itemType}
Brand,${reportData.brandName}
Description,${reportData.description}
Warehouse Location,${reportData.warehouseLocation}
Status,${reportData.status}
Created Date,${formatDate(reportData.createdAt)}
Last Updated,${formatDate(reportData.updatedAt)}

=== QUANTITY ANALYSIS ===
Metric,Value,Percentage
Total Delivered,${reportData.deliveredQuantity},100%
Available Quantity,${reportData.availableQuantity},${reportData.availabilityRate}%
Damaged Quantity,${reportData.damagedQuantity},${reportData.damageRate}%
Lost Quantity,${reportData.lostQuantity},${reportData.lossRate}%
Usable Items,${reportData.usableQuantity},${reportData.availabilityRate}%
Non-Usable Items,${reportData.nonUsableQuantity},${(parseFloat(reportData.damageRate) + parseFloat(reportData.lossRate)).toFixed(2)}%

=== PERFORMANCE METRICS ===
Metric,Value,Status
Utilization Rate,${reportData.utilizationRate}%,${parseFloat(reportData.utilizationRate) > 70 ? 'Good' : parseFloat(reportData.utilizationRate) > 40 ? 'Fair' : 'Poor'}
Damage Rate,${reportData.damageRate}%,${parseFloat(reportData.damageRate) < 5 ? 'Excellent' : parseFloat(reportData.damageRate) < 10 ? 'Good' : 'Needs Attention'}
Loss Rate,${reportData.lossRate}%,${parseFloat(reportData.lossRate) < 2 ? 'Excellent' : parseFloat(reportData.lossRate) < 5 ? 'Good' : 'Needs Attention'}
Availability Rate,${reportData.availabilityRate}%,${parseFloat(reportData.availabilityRate) > 80 ? 'Excellent' : parseFloat(reportData.availabilityRate) > 60 ? 'Good' : 'Low Stock'}

=== QUANTITY DISTRIBUTION (For Charts) ===
Category,Quantity,Percentage
Available,${reportData.availableQuantity},${reportData.availabilityRate}%
Damaged,${reportData.damagedQuantity},${reportData.damageRate}%
Lost,${reportData.lostQuantity},${reportData.lossRate}%

=== STATUS SUMMARY ===
Overall Health,${(() => {
      const availability = parseFloat(reportData.availabilityRate)
      const damage = parseFloat(reportData.damageRate)
      const loss = parseFloat(reportData.lossRate)
      
      if (availability > 80 && damage < 5 && loss < 2) return 'Excellent'
      if (availability > 60 && damage < 10 && loss < 5) return 'Good'
      if (availability > 40) return 'Fair'
      return 'Needs Attention'
    })()}
Recommendations,${(() => {
      const availability = parseFloat(reportData.availabilityRate)
      const damage = parseFloat(reportData.damageRate)
      const loss = parseFloat(reportData.lossRate)
      
      let recommendations = []
      if (availability < 50) recommendations.push('Consider restocking')
      if (damage > 10) recommendations.push('Review handling procedures')
      if (loss > 5) recommendations.push('Improve security measures')
      if (recommendations.length === 0) recommendations.push('Item is performing well')
      
      return recommendations.join('; ')
    })()}

=== ACTIVITY HISTORY ===
Date,Action,Description,User
${activities.map(activity => 
  `${formatDate(activity.timestamp)},${activity.action},${activity.description},${activity.user}`
).join('\n')}

Note: This CSV file can be opened in Excel for further analysis and chart creation.
You can create charts using the "Quantity Distribution" section data.`
  }

  const generateItemReportHTML = (reportData: any) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Item Report - ${reportData.itemName}</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
            color: #333;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0 0 10px 0;
            font-size: 2.5em;
        }
        .header p {
            margin: 0;
            opacity: 0.9;
            font-size: 1.2em;
        }
        .content {
            padding: 30px;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 30px;
            margin-bottom: 30px;
        }
        .card {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            border-left: 4px solid #667eea;
        }
        .card h3 {
            margin: 0 0 15px 0;
            color: #667eea;
            font-size: 1.3em;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
        }
        .info-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
        }
        .info-item:last-child {
            border-bottom: none;
        }
        .label {
            font-weight: 600;
            color: #495057;
        }
        .value {
            color: #212529;
            font-weight: 500;
        }
        .chart-container {
            background: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            margin-bottom: 30px;
        }
        .chart-wrapper {
            position: relative;
            height: 400px;
            margin-top: 20px;
        }
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        .metric-card {
            background: white;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            border-top: 3px solid #667eea;
        }
        .metric-value {
            font-size: 2em;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 5px;
        }
        .metric-label {
            font-size: 0.9em;
            color: #6c757d;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8em;
            font-weight: 600;
            text-transform: uppercase;
        }
        .status-excellent {
            background: #d4edda;
            color: #155724;
        }
        .status-good {
            background: #d1ecf1;
            color: #0c5460;
        }
        .status-fair {
            background: #fff3cd;
            color: #856404;
        }
        .status-poor {
            background: #f8d7da;
            color: #721c24;
        }
        .print-button {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #667eea;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        .print-button:hover {
            background: #5a67d8;
        }
        @media print {
            .print-button {
                display: none;
            }
            body {
                background: white;
            }
            .container {
                box-shadow: none;
            }
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #dee2e6;
        }
        th {
            background: #f8f9fa;
            font-weight: 600;
            color: #495057;
        }
        tr:hover {
            background: #f8f9fa;
        }
    </style>
</head>
<body>
    <button class="print-button" onclick="window.print()">Print Report</button>
    
    <div class="container">
        <div class="header">
            <h1>${reportData.itemName}</h1>
            <p>Detailed Item Report - Generated on ${new Date(reportData.reportGeneratedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
        </div>
        
        <div class="content">
            <!-- Key Metrics -->
            <div class="metrics-grid">
                <div class="metric-card">
                    <div class="metric-value">${reportData.availableQuantity}</div>
                    <div class="metric-label">Available</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${reportData.deliveredQuantity}</div>
                    <div class="metric-label">Total Delivered</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${reportData.availabilityRate}%</div>
                    <div class="metric-label">Availability Rate</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${reportData.utilizationRate}%</div>
                    <div class="metric-label">Utilization Rate</div>
                </div>
            </div>

            <!-- Charts -->
            <div class="chart-container">
                <h3>Quantity Distribution</h3>
                <div class="chart-wrapper">
                    <canvas id="quantityChart"></canvas>
                </div>
            </div>

            <div class="chart-container">
                <h3>Performance Metrics</h3>
                <div class="chart-wrapper">
                    <canvas id="metricsChart"></canvas>
                </div>
            </div>

            <!-- Detailed Information -->
            <div class="grid">
                <div class="card">
                    <h3>Basic Information</h3>
                    <div class="info-item">
                        <span class="label">Item ID:</span>
                        <span class="value">${reportData.itemId}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Type:</span>
                        <span class="value">${reportData.itemType}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Brand:</span>
                        <span class="value">${reportData.brandName}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Location:</span>
                        <span class="value">${reportData.warehouseLocation}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Status:</span>
                        <span class="value">${reportData.status}</span>
                    </div>
                </div>

                <div class="card">
                    <h3>Quantity Breakdown</h3>
                    <div class="info-item">
                        <span class="label">Delivered:</span>
                        <span class="value">${reportData.deliveredQuantity}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Available:</span>
                        <span class="value">${reportData.availableQuantity}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Damaged:</span>
                        <span class="value">${reportData.damagedQuantity}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Lost:</span>
                        <span class="value">${reportData.lostQuantity}</span>
                    </div>
                </div>

                <div class="card">
                    <h3>Performance Status</h3>
                    <div class="info-item">
                        <span class="label">Damage Rate:</span>
                        <span class="value">${reportData.damageRate}% <span class="status-badge status-${parseFloat(reportData.damageRate) < 5 ? 'excellent' : parseFloat(reportData.damageRate) < 10 ? 'good' : 'poor'}">${parseFloat(reportData.damageRate) < 5 ? 'Excellent' : parseFloat(reportData.damageRate) < 10 ? 'Good' : 'Needs Attention'}</span></span>
                    </div>
                    <div class="info-item">
                        <span class="label">Loss Rate:</span>
                        <span class="value">${reportData.lossRate}% <span class="status-badge status-${parseFloat(reportData.lossRate) < 2 ? 'excellent' : parseFloat(reportData.lossRate) < 5 ? 'good' : 'poor'}">${parseFloat(reportData.lossRate) < 2 ? 'Excellent' : parseFloat(reportData.lossRate) < 5 ? 'Good' : 'Needs Attention'}</span></span>
                    </div>
                    <div class="info-item">
                        <span class="label">Availability:</span>
                        <span class="value">${reportData.availabilityRate}% <span class="status-badge status-${parseFloat(reportData.availabilityRate) > 80 ? 'excellent' : parseFloat(reportData.availabilityRate) > 60 ? 'good' : 'poor'}">${parseFloat(reportData.availabilityRate) > 80 ? 'Excellent' : parseFloat(reportData.availabilityRate) > 60 ? 'Good' : 'Low Stock'}</span></span>
                    </div>
                </div>

                <div class="card">
                    <h3>Timeline</h3>
                    <div class="info-item">
                        <span class="label">Created:</span>
                        <span class="value">${new Date(reportData.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Last Updated:</span>
                        <span class="value">${new Date(reportData.updatedAt).toLocaleDateString()}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Report Generated:</span>
                        <span class="value">${new Date(reportData.reportGeneratedAt).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>

            <!-- Activity History Table -->
            <div class="card">
                <h3>Recent Activity History</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Action</th>
                            <th>Description</th>
                            <th>User</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${activities.map(activity => `
                        <tr>
                            <td>${new Date(activity.timestamp).toLocaleDateString()}</td>
                            <td>${activity.action.replace('_', ' ').toUpperCase()}</td>
                            <td>${activity.description}</td>
                            <td>${activity.user}</td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <script>
        // Quantity Distribution Pie Chart
        const quantityCtx = document.getElementById('quantityChart').getContext('2d');
        new Chart(quantityCtx, {
            type: 'doughnut',
            data: {
                labels: ['Available', 'Damaged', 'Lost'],
                datasets: [{
                    data: [${reportData.availableQuantity}, ${reportData.damagedQuantity}, ${reportData.lostQuantity}],
                    backgroundColor: ['#28a745', '#ffc107', '#dc3545'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            font: {
                                size: 14
                            }
                        }
                    }
                }
            }
        });

        // Performance Metrics Bar Chart
        const metricsCtx = document.getElementById('metricsChart').getContext('2d');
        new Chart(metricsCtx, {
            type: 'bar',
            data: {
                labels: ['Availability Rate', 'Utilization Rate', 'Damage Rate', 'Loss Rate'],
                datasets: [{
                    label: 'Percentage',
                    data: [${reportData.availabilityRate}, ${reportData.utilizationRate}, ${reportData.damageRate}, ${reportData.lossRate}],
                    backgroundColor: ['#28a745', '#17a2b8', '#ffc107', '#dc3545'],
                    borderWidth: 0,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });
    </script>
</body>
</html>`;
  }

  const generateReport = async () => {
    try {
      // Generate comprehensive report data
      const reportData = {
        // Basic Item Information
        itemId: item.id,
        itemName: item.name,
        itemType: item.type,
        brandName: item.brand_name || 'No Brand',
        description: item.description || 'No description',
        
        // Quantities and Status
        deliveredQuantity: item.delivered_quantity,
        availableQuantity: item.available_quantity,
        damagedQuantity: item.damaged_quantity,
        lostQuantity: item.lost_quantity,
        totalQuantity: item.delivered_quantity,
        usableQuantity: item.available_quantity,
        nonUsableQuantity: item.damaged_quantity + item.lost_quantity,
        
        // Location Information
        warehouseLocation: item.warehouse_location_name || 'No Location',
        status: item.status || 'Active',
        
        // Timestamps
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        reportGeneratedAt: new Date().toISOString(),
        
        // Calculated Metrics
        utilizationRate: item.delivered_quantity > 0 
          ? ((item.delivered_quantity - item.available_quantity) / item.delivered_quantity * 100).toFixed(2)
          : '0.00',
        damageRate: item.delivered_quantity > 0 
          ? (item.damaged_quantity / item.delivered_quantity * 100).toFixed(2)
          : '0.00',
        lossRate: item.delivered_quantity > 0 
          ? (item.lost_quantity / item.delivered_quantity * 100).toFixed(2)
          : '0.00',
        availabilityRate: item.delivered_quantity > 0 
          ? (item.available_quantity / item.delivered_quantity * 100).toFixed(2)
          : '0.00'
      }

      // Generate CSV report
      const csvContent = generateItemReportCSV(reportData)
      
      // Create and download CSV file
      const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const csvUrl = URL.createObjectURL(csvBlob)
      const csvLink = document.createElement('a')
      csvLink.href = csvUrl
      csvLink.download = `${item.name.replace(/[^a-z0-9]/gi, '_')}_Report_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(csvLink)
      csvLink.click()
      document.body.removeChild(csvLink)
      URL.revokeObjectURL(csvUrl)

      // Generate HTML report with visualizations
      const htmlContent = generateItemReportHTML(reportData)
      
      // Create and download HTML file
      const htmlBlob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' })
      const htmlUrl = URL.createObjectURL(htmlBlob)
      const htmlLink = document.createElement('a')
      htmlLink.href = htmlUrl
      htmlLink.download = `${item.name.replace(/[^a-z0-9]/gi, '_')}_Visual_Report_${new Date().toISOString().split('T')[0]}.html`
      document.body.appendChild(htmlLink)
      htmlLink.click()
      document.body.removeChild(htmlLink)
      URL.revokeObjectURL(htmlUrl)

      // Show success message
      onSuccess('Reports generated and downloaded successfully! Check your downloads folder for CSV and HTML files.')

    } catch (error) {
      console.error('Error generating report:', error)
      onError('Failed to generate report. Please try again.')
    }
  }

  return { generateReport }
}

export default ReportGenerator