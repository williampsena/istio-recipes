#!/bin/bash

HOST="localhost:30001"
METHOD="greeterJoker.GreeterJoker/Greet"
COUNT="${COUNT:-50}"
PROTO_FILE="apps/node-grpc/proto/greeter_joker.proto"
CONCURRENT_WORKERS="${CONCURRENT_WORKERS:-10}"
TEMP_DIR="/tmp/load_test_$$"

# Create temporary directory for results
mkdir -p "$TEMP_DIR"

# Function to make an individual request
make_request() {
    local id=$1
    local temp_dir=$2
    
    RESPONSE=$(grpcurl -plaintext -proto "$PROTO_FILE" -d "{\"lang\": \"pt\", \"name\": \"User $id\"}" $HOST $METHOD 2>&1)
    
    if [ $? -eq 0 ]; then
        echo "success" > "$temp_dir/result_$id"
        echo "$(date '+%Y-%m-%d %H:%M:%S') - Request $id: ✅ Success" >> "$temp_dir/log"
    else
        echo "failed" > "$temp_dir/result_$id"
        echo "$(date '+%Y-%m-%d %H:%M:%S') - Request $id: ❌ Failed: $RESPONSE" >> "$temp_dir/log"
    fi
}

# Export function to use with parallel/background jobs
export -f make_request
export HOST METHOD PROTO_FILE

echo "🚀 Starting concurrent load test..."
echo "📡 Host: $HOST"
echo "🔄 Method: $METHOD"
echo "📊 Total requests: $COUNT"
echo "⚡ Concurrent workers: $CONCURRENT_WORKERS"
echo "📄 Proto file: $PROTO_FILE"
echo ""

START_TIME=$(date +%s)

# Execute requests in concurrent batches
for ((batch_start=1; batch_start<=COUNT; batch_start+=CONCURRENT_WORKERS)); do
    batch_end=$((batch_start + CONCURRENT_WORKERS - 1))
    if [ $batch_end -gt $COUNT ]; then
        batch_end=$COUNT
    fi
    
    echo "📦 Processing batch $(((batch_start-1)/CONCURRENT_WORKERS + 1)): requests $batch_start-$batch_end"
    
    # Execute batch requests in parallel
    for ((i=batch_start; i<=batch_end; i++)); do
        make_request $i "$TEMP_DIR" &
    done
    
    # Wait for all batch jobs to finish
    wait
    
    # Show progress
    completed=$batch_end
    echo "✅ Completed: $completed/$COUNT"
    
    # Small pause between batches
    sleep 0.5
done

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

# Count results
SUCCESS=$(find "$TEMP_DIR" -name "result_*" -exec cat {} \; | grep -c "success")
FAILED=$(find "$TEMP_DIR" -name "result_*" -exec cat {} \; | grep -c "failed")

echo ""
echo "📈 Results:"
echo "✅ Success: $SUCCESS"
echo "❌ Failures: $FAILED"
echo "⏱️  Duration: ${DURATION}s"
echo "🚀 Requests/second: $(echo "scale=2; $COUNT / $DURATION" | bc 2>/dev/null || echo "$((COUNT / DURATION))")"

if command -v bc &> /dev/null; then
    echo "📊 Success: $(echo "scale=2; $SUCCESS * 100 / $COUNT" | bc)%"
else
    echo "📊 Success: $((SUCCESS * 100 / COUNT))%"
fi

# Show error log if any
if [ $FAILED -gt 0 ]; then
    echo ""
    echo "🔍 Errors found:"
    grep "Failed" "$TEMP_DIR/log" | head -5
    if [ $FAILED -gt 5 ]; then
        echo "... and $((FAILED - 5)) more errors"
    fi
fi

# Clean up temporary files
rm -rf "$TEMP_DIR"
