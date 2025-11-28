
#!/bin/bash

# agent.sh - Script for dynamically launching and managing standalone GodBrain agents.

# --- Configuration ---
NODE_COMMAND="node"
RUNNER_SCRIPT="run-agent.js"
LOG_DIR="logs"

# --- Functions ---

# Function to display usage information
usage() {
    echo "Usage: $0 <command> [options]"
    echo ""
    echo "Commands:"
    echo "  start     Start one or more new agents."
    echo "  stop      Stop agents of a specific type."
    echo ""
    echo "Options for 'start':"
    echo "  --type <AgentClassName>   The class name of the agent to start (e.g., ReconAgent). Required."
    echo "  --count <number>          The number of agent instances to start (default: 1)."
    echo ""
    echo "Options for 'stop':"
    echo "  --type <AgentClassName>   The class name of the agents to stop. Required."
    echo ""
    echo "Example:"
    echo "  ./agent.sh start --type ReconAgent --count 5"
    echo "  ./agent.sh stop --type ReconAgent"
}

# Function to start agents
start_agents() {
    AGENT_TYPE=""
    COUNT=1

    # Parse arguments
    while [ "$#" -gt 0 ]; do
        case "$1" in
            --type) AGENT_TYPE="$2"; shift 2;;
            --count) COUNT="$2"; shift 2;;
            *) shift 1;;
        esac
    done

    if [ -z "$AGENT_TYPE" ]; then
        echo "Error: --type is required for starting agents."
        usage
        exit 1
    fi

    echo "Compiling TypeScript source..."
    npx tsc
    if [ $? -ne 0 ]; then
        echo "TypeScript compilation failed. Aborting."
        exit 1
    fi

    mkdir -p "$LOG_DIR"

    echo "Starting $COUNT instance(s) of $AGENT_TYPE..."

    for i in $(seq 1 $COUNT); do
        LOG_FILE="$LOG_DIR/${AGENT_TYPE}_${i}.log"
        echo "Launching instance $i, logging to $LOG_FILE"
        nohup $NODE_COMMAND $RUNNER_SCRIPT --type="$AGENT_TYPE" > "$LOG_FILE" 2>&1 &
        PID=$!
        echo "  -> Started with PID $PID"
    done

    echo "Done."
}

# Function to stop agents
stop_agents() {
    AGENT_TYPE=""

    # Parse arguments
    while [ "$#" -gt 0 ]; do
        case "$1" in
            --type) AGENT_TYPE="$2"; shift 2;;
            *) shift 1;;
        esac
    done

    if [ -z "$AGENT_TYPE" ]; then
        echo "Error: --type is required for stopping agents."
        usage
        exit 1
    fi

    echo "Stopping all instances of $AGENT_TYPE..."
    # This is a bit naive, it will kill all node processes with the agent type in their command line
    pkill -f "run-agent.js --type=$AGENT_TYPE"
    echo "Stop command issued."
}


# --- Main ---
COMMAND=$1
shift

if [ -z "$COMMAND" ]; then
    usage
    exit 1
fi

case "$COMMAND" in
    start)
        start_agents "$@"
        ;;
    stop)
        stop_agents "$@"
        ;;
    *)
        echo "Error: Unknown command '$COMMAND'"
        usage
        exit 1
        ;;
esac
