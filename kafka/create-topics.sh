#!/bin/bash

# Create the first topic
echo "Creating topic: report-creation-events"
/opt/kafka/bin/kafka-topics.sh --create --topic report-creation-events --bootstrap-server broker:29092 --partitions 1 --replication-factor 1

# Create the second topic
echo "Creating topic: submission-events"
/opt/kafka/bin/kafka-topics.sh --create --topic submission-events --bootstrap-server broker:29092 --partitions 1 --replication-factor 1

echo "Topics created successfully!"
