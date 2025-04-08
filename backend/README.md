# PerfectCV API Monitoring System

This monitoring system is designed to track API traffic, analyze token usage, and identify potential issues with authentication and authorization in the PerfectCV API.

## Components

The monitoring system consists of the following components:

1. **Traffic Monitor (`monitor_traffic.py`)**: Middleware that intercepts all API requests and responses, logs them to a database, and provides real-time analysis.

2. **Traffic Test (`test_monitoring.py`)**: Script that generates test traffic to the API, including requests with and without tokens, invalid tokens, and various endpoints.

3. **Log Analysis (`analyze_logs.py`)**: Script that analyzes the traffic logs, generates statistics, and creates visualizations.

4. **Run Scripts**:
   - `run_monitoring.ps1`: PowerShell script to run the monitoring system
   - `run_monitoring.bat`: Batch script to run the monitoring system
   - `run_monitoring_test.py`: Python script that orchestrates the entire monitoring process

## Setup

1. Create a virtual environment:
   ```
   python -m venv venv
   ```

2. Activate the virtual environment:
   - Windows: `.\venv\Scripts\activate`
   - Unix/MacOS: `source venv/bin/activate`

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

## Running the Monitoring System

### Using PowerShell

```
.\run_monitoring.ps1
```

### Using Batch File

```
.\run_monitoring.bat
```

### Using Python Directly

```
python run_monitoring_test.py
```

## What the Monitoring System Tracks

The monitoring system tracks the following information for each API request:

- Request method, URL, and headers
- Response status code and headers
- Request and response duration
- Token presence and validity
- Error messages
- Request and response bodies (limited to 1000 characters)

## Analysis Output

The analysis script generates the following outputs:

1. **Console Output**: Detailed statistics about API traffic, including:
   - Total requests
   - Requests with and without tokens
   - Token validity statistics
   - Status code distribution
   - Endpoint usage
   - Performance metrics

2. **Visualizations**: PNG files in the `analysis_output` directory:
   - Status code distribution
   - Top 10 endpoints
   - Request duration distribution
   - Token usage by hour
   - Status code by token presence

## Troubleshooting

If you encounter issues with the monitoring system:

1. Check the `api_traffic.log` file for detailed logs
2. Verify that the SQLite database (`traffic_monitor.db`) is being created and updated
3. Ensure that the FastAPI application is running and accessible
4. Check that all required dependencies are installed

## Customization

You can customize the monitoring system by:

1. Modifying the `TrafficLog` model in `monitor_traffic.py` to track additional fields
2. Adding new test cases to `test_monitoring.py`
3. Extending the analysis in `analyze_logs.py` to include additional metrics
4. Adjusting the delay between requests in the test script

## Integration with the Main Application

The monitoring system is integrated with the main FastAPI application through the `setup_monitoring` function in `monitor_traffic.py`, which is called in `app/main.py`. The monitoring middleware intercepts all requests and responses, and the analysis is performed when the application shuts down. 