from fastapi import FastAPI, Response
import os
import requests
from data_parsing.file_parser import FileParser



app = FastAPI()
parser = FileParser()

JS_ENDPOINT = "http://localhost:3000" 
BASE_PATH = "../../01_Data_Parsing/01_Python/files"

@app.get("/movie/json")
def get_movie_json():
    return parser.parse_json(os.path.join(BASE_PATH, "pulp_fiction.json"))

@app.get("/movie/xml")
def get_movie_xml():
    content = parser.parse_xml(os.path.join(BASE_PATH, "pulp_fiction.xml"))
    return Response(content, media_type="application/xml")

@app.get("/movie/yaml")
def get_movie_yaml():
    content = parser.parse_yaml(os.path.join(BASE_PATH, "pulp_fiction.yaml"))
    return Response(content, media_type="text/yaml")

@app.get("/movie/text")
def get_movie_text():
    content = parser.parse_text(os.path.join(BASE_PATH, "pulp_fiction.txt"))
    return Response(content, media_type="text/plain")

@app.get("/movie/csv")
def get_movie_csv():
    content = parser.parse_csv(os.path.join(BASE_PATH, "pulp_fiction.csv"))
    return Response(content, media_type="text/csv")

@app.get("/sts/json")
def bridge_json():
    result = requests.get(f"{JS_ENDPOINT}/movie/json")
    return Response(result.text, media_type="application/json")

@app.get("/sts/xml")
def bridge_xml():
    result = requests.get(f"{JS_ENDPOINT}/movie/xml")
    return Response(result.text, media_type="application/xml")

@app.get("/sts/yaml")
def bridge_yaml():
    result = requests.get(f"{JS_ENDPOINT}/movie/yaml")
    return Response(result.text, media_type="text/yaml")

@app.get("/sts/text")
def bridge_text():
    result = requests.get(f"{JS_ENDPOINT}/movie/text")
    return Response(result.text, media_type="text/plain")

@app.get("/sts/csv")
def bridge_csv():
    result = requests.get(f"{JS_ENDPOINT}/movie/csv")
    return Response(result.text, media_type="text/csv")
