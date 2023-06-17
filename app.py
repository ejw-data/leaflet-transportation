import numpy as np
import json

from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func

from flask import Flask, jsonify, render_template


#################################################
# Database Setup
#################################################
engine = create_engine("sqlite:///static/data/transportation.db")

# reflect an existing database into a new model
Base = automap_base()
# reflect the tables
Base.prepare(engine, reflect=True)

# Save reference to the table
Population = Base.classes.population
Distance = Base.classes.distance

#################################################
# Flask Setup
#################################################
app = Flask(__name__)


#################################################
# Flask Routes
#################################################

@app.route("/")
def welcome():
    return render_template("index.html")


@app.route("/api/v1.0/population/<year>")
def population(year):
    # Create our session (link) from Python to the DB
    session = Session(engine)

    """Return a list of all major cities and population"""
    # Query all population data
    year_selected = eval(f'Population.y{year}')
    results = session.query(Population.city, year_selected, Population.lat, Population.lon).all()

    session.close()
    
    # Convert list of tuples into normal list
    all_cities = []
    for city, population, lat, lon in results:
        city_dict = {}
        city_dict["City"] = city
        city_dict["2022"] = population
        city_dict["lat"] = lat
        city_dict["long"] = lon
        all_cities.append(city_dict)

    return jsonify(all_cities)

@app.route("/api/v1.0/states")
def states():
    session = Session(engine)

    results = session.query(Population.state).distinct(Population.state).order_by(Population.state.asc()).all()

    all_states=[]
    for state in results:
        all_states.append(state[0])

    session.close()
    print(all_states)
    return all_states


@app.route("/api/v1.0/cities")
def names():
    # Create our session (link) from Python to the DB
    session = Session(engine)

    results = session.query(Population.state, Population.city).distinct(Population.state, Population.city).all()

    all_cities=[]
    for state, city in results:
        all_cities.append({'state':state, 'city':city})

    session.close()
    print(all_cities)
    return all_cities

@app.route("/api/v1.0/<dist>/<mpop>/<cpop>")
def distances(dist, mpop, cpop):
    session = Session(engine)

    results = session.query(Distance.distance, Distance.population1, Distance.population2, (Distance.population1+Distance.population2), Distance.point1, Distance.point2).filter(Distance.distance <= dist).filter(Distance.population1 >= mpop).all()

    paired_data=[]
    for d, pop1, pop2, sumval, pt1, pt2 in results:
        ## if statement added because doing this filtering in sqlalchemy is difficult
        if sumval >= int(cpop):
            paired_data.append({'distance':d, 'population1':pop1, 'population2':pop2, 'point1':eval(pt1), 'point2':eval(pt2)})

    session.close()

    return paired_data
# @app.route("/api/v1.0/boundaries")
# def boundary():
#     with open("./static/data/allData_reduced.geojson") as file:
#         json_decoded = json.load(file)

#     return json_decoded



if __name__ == '__main__':
    app.run(debug=True)
