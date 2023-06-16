# leaflet-transportation


## Fix database structure

### Current Tables Setup
1.  Population
1.  Distance

### Improved Structure
1.  City - id , city name, coordinates
1.  Population - id (FK), year, population
1.  Distance - id(FK), id(Fk), distance

### Queries
- Create view of city1, city2, state1, state2, distance, point1, point2, population1, population2
- Simple queries: 
```Select point1, point2 From View Where (population1 > x) AND (SUM(population1+population2) > y) AND (distance < z)```

OR

- Create queries with filters like  distance, population1, summed popultion 
`