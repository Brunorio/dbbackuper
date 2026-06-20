mydumper --host 127.0.0.1 --user root --password 123456 --database atalhus --outputdir ./backups/atalhus-test-v2  --compress --compress --triggers --events --routines

myloader --host 127.0.0.1 --user root --password 123456 --database atalhus --directory ./backups/atalhus-test-v5 --overwrite-tables