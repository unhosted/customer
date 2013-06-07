#! /bin/bash

SUBDOMAIN=$1
NS="heahdk.net."
KEYFILE="Kadmin.un.ht.something.private "

nsupdate -k $KEYFILE -v <<EOF 
server un.ht
zone un.ht
update delete $SUBDOMAIN.un.ht. ANY
show
send
EOF
