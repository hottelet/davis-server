"use strict";

const EVENT_TYPE_AVAILABILITY = "availability";
const EVENT_TYPE_ERRORS = "errors";
const EVENT_TYPE_PERFORMANCE = "performance";
const EVENT_TYPE_RESOURCES = "resources";

const events = [
  {
    name: "WEB_CHECK_GLOBAL_OUTAGE",
    type: EVENT_TYPE_AVAILABILITY,
    friendly: ["a global outage for synthetic based web checks"],
  },
  {
    name: "PROCESS_CUSTOM_AVAILABILITY",
    type: EVENT_TYPE_AVAILABILITY,
    friendly: ["an unavailable process"],
  },
  {
    name: "PROCESS_LOG_AVAILABILITY",
    type: EVENT_TYPE_AVAILABILITY,
    friendly: ["an availability issue affecting a user defined process"],
  },
  {
    name: "OPENSTACK_KEYSTONE_UNHEALTHY",
    type: EVENT_TYPE_AVAILABILITY,
    friendly: ["an issue with the Open Stack Keystone"],
  },
  {
    name: "HOST_LOG_AVAILABILITY",
    type: EVENT_TYPE_AVAILABILITY,
    friendly: ["a host availability issue discovered in the logs"],
  },
  {
    name: "PROCESS_CRASHED",
    type: EVENT_TYPE_AVAILABILITY,
    friendly: ["a process that crashed", "crashed process"],
  },
  {
    name: "MOBILE_APP_CRASH_RATE_INCREASED",
    type: EVENT_TYPE_AVAILABILITY,
    friendly: ["an increase in mobile app crashes"],
  },
  {
    name: "RDS_OF_SERVICE_UNAVAILABLE",
    type: EVENT_TYPE_AVAILABILITY,
    friendly: ["an unavailable RDS"],
  },
  {
    name: "RDS_RESTART_SEQUENCE",
    type: EVENT_TYPE_AVAILABILITY,
    friendly: ["an RDS restart"],
  },
  {
    name: "PGI_OF_SERVICE_UNAVAILABLE",
    type: EVENT_TYPE_AVAILABILITY,
    friendly: ["an unavailable process group instance"],
  },
  {
    name: "CONNECTION_LOST",
    type: EVENT_TYPE_AVAILABILITY,
    friendly: ["a lost connection"],
  },
  {
    name: "PROCESS_UNAVAILABLE",
    type: EVENT_TYPE_AVAILABILITY,
    friendly: ["an unavailable process"],
  },
  {
    name: "HOST_OF_SERVICE_UNAVAILABLE",
    type: EVENT_TYPE_AVAILABILITY,
    friendly: ["an unavailable host"],
  },
  {
    name: "HOST_CONNECTION_LOST",
    type: EVENT_TYPE_AVAILABILITY,
    friendly: ["an issue connecting to the host"],
  },
  {
    name: "WEB_CHECK_LOCAL_OUTAGE",
    type: EVENT_TYPE_AVAILABILITY,
    friendly: ["a local outage for synthetic based web checks"],
  },
  {
    name: "CUSTOM_ALERT",
    type: EVENT_TYPE_ERRORS,
    friendly: ["a user defined alert"],
  },
  {
    name: "PROCESS_CUSTOM_ERROR",
    type: EVENT_TYPE_ERRORS,
    friendly: ["a user defined process error"],
  },
  {
    name: "PROCESS_LOG_ERROR",
    type: EVENT_TYPE_ERRORS,
    friendly: ["an error found in the process log"],
  },
  {
    name: "HOST_LOG_ERROR",
    type: EVENT_TYPE_ERRORS,
    friendly: ["an error found in the host log"],
  },
  {
    name: "JAVASCRIPT_ERROR_RATE_INCREASED",
    type: EVENT_TYPE_ERRORS,
    friendly: ["an increase in JavaScript errors"],
  },
  {
    name: "MOBILE_APP_HTTP_ERROR_RATE_INCREASED",
    type: EVENT_TYPE_ERRORS,
    friendly: ["an increase in mobile app errors"],
  },
  {
    name: "FAILURE_RATE_INCREASED",
    type: EVENT_TYPE_ERRORS,
    friendly: ["an increase in failure rate"],
  },
  {
    name: "HIGH_CONNECTIVITY_FAILURES",
    type: EVENT_TYPE_ERRORS,
    friendly: ["a high number of connectivity failures"],
  },
  {
    name: "HIGH_DROPPED_PACKETS_RATE",
    type: EVENT_TYPE_ERRORS,
    friendly: ["a high number of dropped packets"],
  },
  {
    name: "ELASTIC_LOAD_BALANCER_HIGH_UNHEALTHY_HOST_RATE",
    type: EVENT_TYPE_ERRORS,
    friendly: ["an unexpected number of unhealthy hosts"],
  },
  {
    name: "ELASTIC_LOAD_BALANCER_HIGH_FAILURE_RATE",
    type: EVENT_TYPE_ERRORS,
    friendly: ["a high failure rate"],
  },
  {
    name: "ELASTIC_LOAD_BALANCER_HIGH_BACKEND_FAILURE_RATE",
    type: EVENT_TYPE_ERRORS,
    friendly: ["a high backend failure rate"],
  },
  {
    name: "HIGH_NETWORK_ERROR_RATE",
    type: EVENT_TYPE_ERRORS,
    friendly: ["a high network error rate"],
  },
  {
    name: "HOST_CONNECTION_FAILED",
    type: EVENT_TYPE_ERRORS,
    friendly: ["an issue connecting to the host"],
  },
  {
    name: "SYNTHETIC_SLOWDOWN",
    type: EVENT_TYPE_PERFORMANCE,
    friendly: ["a decrease in synthetic response time"],
  },
  {
    name: "HOST_LOG_PERFORMANCE",
    type: EVENT_TYPE_PERFORMANCE,
    friendly: ["a host performance issue discovered in the logs"],
  },
  {
    name: "PROCESS_LOG_PERFORMANCE",
    type: EVENT_TYPE_PERFORMANCE,
    friendly: ["a performance issue discovered in the logs of a process"],
  },
  {
    name: "PROCESS_CUSTOM_PERFORMANCE",
    type: EVENT_TYPE_PERFORMANCE,
    friendly: ["a performance issue affecting a user defined process"],
  },
  {
    name: "USER_ACTION_DURATION_DEGRADATION",
    type: EVENT_TYPE_PERFORMANCE,
    friendly: ["a degradation in user action response time"],
  },
  {
    name: "OPENSTACK_KEYSTONE_SLOW",
    type: EVENT_TYPE_PERFORMANCE,
    friendly: ["a performance degradation on Open Stack Keystone"],
  },
  {
    name: "MOBILE_APP_HTTP_SLOWDOWN",
    type: EVENT_TYPE_PERFORMANCE,
    friendly: ["a slowdown of HTTP calls on mobile"],
  },
  {
    name: "SERVICE_RESPONSE_TIME_DEGRADED",
    type: EVENT_TYPE_PERFORMANCE,
    friendly: ["a decrease in service response time", "a slower service response time", "a degraded service response time", "an abnormal response time", "a higher than expected response time"],
  },
  {
    name: "PROCESS_RESPONSIVENESS_DEGRADATION",
    type: EVENT_TYPE_PERFORMANCE,
    friendly: ["a degradation in the process responsiveness"],
  },
  {
    name: "HIGH_LATENCY",
    type: EVENT_TYPE_PERFORMANCE,
    friendly: ["a higher than normal latency"],
  },
  {
    name: "HIGH_GC_ACTIVITY",
    type: EVENT_TYPE_PERFORMANCE,
    friendly: ["an abnormal amount of garbage collection activity", "frequent garbage collection activity"],
  },
  {
    name: "UNEXPECTED_LOW_LOAD",
    type: EVENT_TYPE_PERFORMANCE,
    friendly: ["a lower than expected load on the application"],
  },
  {
    name: "LOW_DISK_SPACE",
    type: EVENT_TYPE_RESOURCES,
    friendly: ["a lack of disk space"],
  },
  {
    name: "HOST_DATASTORE_LOW_DISK_SPACE",
    type: EVENT_TYPE_RESOURCES,
    friendly: ["a lack of host data store space"],
  },
  {
    name: "LOW_STORAGE_SPACE",
    type: EVENT_TYPE_RESOURCES,
    friendly: ["a lack of disk space"],
  },
  {
    name: "PGI_RMQ_LOW_DISK_SPACE",
    type: EVENT_TYPE_RESOURCES,
    friendly: ["a lack of disk space"],
  },
  {
    name: "OSI_DOCKER_DEVICEMAPPER_LOW_DATA_SPACE",
    type: EVENT_TYPE_RESOURCES,
    friendly: ["a lack of data space affecting Docker"],
  },
  {
    name: "OSI_DOCKER_DEVICEMAPPER_LOW_METADATA_SPACE",
    type: EVENT_TYPE_RESOURCES,
    friendly: ["a lack of metadata space affecting Docker"],
  },
  {
    name: "THREADS_RESOURCES_EXHAUSTED",
    type: EVENT_TYPE_RESOURCES,
    friendly: ["a lack of available threads"],
  },
  {
    name: "INSUFFICIENT_DISK_QUEUE_DEPTH",
    type: EVENT_TYPE_RESOURCES,
    friendly: ["an insufficient disk queue depth"],
  },
  {
    name: "MEMORY_SATURATED",
    type: EVENT_TYPE_RESOURCES,
    friendly: ["a memory saturation", "a high memory usage"],
  },
  {
    name: "MEMORY_RESOURCES_EXHAUSTED",
    type: EVENT_TYPE_RESOURCES,
    friendly: ["a lack of memory"],
  },
  {
    name: "PGI_RMQ_HIGH_MEM_USAGE",
    type: EVENT_TYPE_RESOURCES,
    friendly: ["an issue with Rabbit messaging queue's allocated memory"],
  },
  {
    name: "DOCKER_MEMORY_SATURATION",
    type: EVENT_TYPE_RESOURCES,
    friendly: ["an issue with Docker using all of it's allocated memory"],
  },
  {
    name: "CPU_SATURATED",
    type: EVENT_TYPE_RESOURCES,
    friendly: ["a saturated CPU", "an overwhelmed CPU"],
  },
  {
    name: "SLOW_DISK",
    type: EVENT_TYPE_RESOURCES,
    friendly: ["a slower than normal disk"],
  },
  {
    name: "PGI_RMQ_HIGH_FILE_DESC_USAGE",
    type: EVENT_TYPE_RESOURCES,
    friendly: ["a higher than normal file descriptor count on Rabbit MQ"],
  },
  {
    name: "EBS_VOLUME_HIGH_LATENCY",
    type: EVENT_TYPE_RESOURCES,
    friendly: ["a latency spike on an EBS volume"],
  },
  {
    name: "OVERLOADED_STORAGE",
    type: EVENT_TYPE_RESOURCES,
    friendly: ["an overloaded storage module"],
  },
  {
    name: "HIGH_NETWORK_LOSS_RATE",
    type: EVENT_TYPE_RESOURCES,
    friendly: ["a high network loss rate"],
  },
  {
    name: "HIGH_NETWORK_UTILIZATION",
    type: EVENT_TYPE_RESOURCES,
    friendly: ["a higher than expect network utilization"],
  },
  {
    name: "PGI_RMQ_HIGH_PROCESS_USAGE",
    type: EVENT_TYPE_RESOURCES,
    friendly: ["a higher than expect process usage"],
  },
  {
    name: "PGI_RMQ_HIGH_SOCKETS_USAGE",
    type: EVENT_TYPE_RESOURCES,
    friendly: ["a higher than expect socket usage"],
  },
  {
    name: "PGI_HAPROXY_QUEUED_REQUESTS_HIGH",
    type: EVENT_TYPE_RESOURCES,
    friendly: ["a large number of requests queued in HA Proxy"],
  },
  {
    name: "PGI_HAPROXY_SESSION_USAGE_HIGH",
    type: EVENT_TYPE_RESOURCES,
    friendly: ["a high number of sessions in HA Proxy"],
  },
  {
    name: "PGI_MYSQL_SLOW_QUERIES_RATE_HIGH",
    type: EVENT_TYPE_RESOURCES,
    friendly: ["a high number of slow queries affecting MySQL"],
  },
  {
    name: "UNEXPECTED_HIGH_LOAD",
    type: EVENT_TYPE_RESOURCES,
    friendly: ["an unexpectedly high amount of load"],
  },
  {
    name: "HOST_TIMEOUT",
    type: EVENT_TYPE_RESOURCES,
    friendly: ["a host timeout"],
  },
  {
    name: "HOST_NO_CONNECTION",
    type: EVENT_TYPE_RESOURCES,
    friendly: ["a missing connection to the host"],
  },
  {
    name: "HOST_SHUTDOWN",
    type: EVENT_TYPE_RESOURCES,
    friendly: ["a host shutdown"],
  },
  {
    name: "VIRTUAL_MACHINE_SHUTDOWN",
    type: EVENT_TYPE_RESOURCES,
    friendly: ["a virtual machine shutdown"],
  },
  {
    name: "ESXI_START",
    type: EVENT_TYPE_RESOURCES,
    friendly: ["an ESXi start"],
  },
  {
    name: "HOST_MAINTENANCE",
    type: EVENT_TYPE_RESOURCES,
    friendly: ["a host under maintenance"],
  },
];

module.exports = events;
