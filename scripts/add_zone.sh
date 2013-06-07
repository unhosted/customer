#!/bin/bash
#USER=$1
set -e
set -x

CONF_DIR=/etc/bind/
CUSTOMERS_DIR=${CONF_DIR}customers/
ZONE_DIR=/var/cache/bind/

TLD=un.ht.
TTL=10

ZONE=$1
KEY=$2
ALGORITHM=$3


if [ -z "$ALGORITHM" ]; then
    ALGORITHM=hmac-md5
fi

mkdir -p $CUSTOMERS_DIR
#dnssec-keygen -a HMAC-MD5 -b 512 -n ZONE $ZONE

# creating minimal zonefile
cat > ${ZONE_DIR}db.${ZONE} <<EOF
\$TTL $TTL
$ZONE.$TLD			IN SOA	$ZONE.$TLD admin.un.ht. ( ;FIXME wrong email
				15         ; serial
				3600       ; refresh (1 hour)
				600        ; retry (10 minutes)
				86400      ; expire (1 day)
				600        ; minimum (10 minutes)
				)
@   NS root.un.ht.
EOF

#creating keyfile
cat > ${CUSTOMERS_DIR}keyfile-$ZONE.key <<EOF
key "$ZONE" {
        algorithm $ALGORITHM;
        secret "$KEY";
};
EOF


rndc addzone $ZONE.$TLD "
{                      
  type master;              
  file \"db.${ZONE}\"; 
  allow-update { 
    key \"$ZONE\";
  };
};"

# regenerate customers config
./rebuild_customer_zones.sh

# restart server
#/etc/init.d/bind9 restart
rndc reload
