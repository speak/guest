Guest Service
=======

To build run 

```
docker-compose -f extra.yml build guest
```

To run run 

```
docker-compose -f extra.yml up
```

Gotcha, only the src directory is a volume in the container so if you make changes to the Gruntfile or package.json you will need to rebuild the container.

You don't need to run npm install yourself.
