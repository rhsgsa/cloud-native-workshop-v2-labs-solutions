The CCN Roadshow(Dev Track) All Modules Solution
===

This repo can be used for reference to the code's solution than a magic script to deploy all things completely at one time just like you go through the labs manually.

=== How to Deploy

1. Login OpenShift cluster via `oc login` in CRW of workshop environment
2. Run the solution script along with each module and username. For example, you can deploy a solution for the module 1 with `user1`:

```
   e.g. $ sh scripts/deploy-solution-m1.sh user1
```

=== Scripts for each Module Solution

* Module 1 : sh scripts/deploy-solution-m1.sh {username}
* Module 2 : sh scripts/deploy-solution-m2.sh {username}
* Module 3 : sh scripts/deploy-solution-m3.sh {username}
* Module 4 : sh scripts/deploy-solution-m4.sh {username}