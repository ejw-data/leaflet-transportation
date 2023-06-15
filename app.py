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
def names(year):
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

# @app.route("/api/v1.0/boundaries")
# def boundary():
#     with open("./static/data/allData_reduced.geojson") as file:
#         json_decoded = json.load(file)

#     return json_decoded



if __name__ == '__main__':
    app.run(debug=True)
