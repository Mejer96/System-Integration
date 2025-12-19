import json
import xml.etree.ElementTree as ET
import yaml
import csv

class FileParser:
    def parse_json(self, file_path: str):
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data

    def parse_xml(self, file_path: str) -> str:
        tree = ET.parse(file_path)
        root = tree.getroot()

        return ET.tostring(root, encoding="utf-8")

    def parse_yaml(self, file_path: str) -> str:
        with open(file_path, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f)
        return yaml.dump(data, default_flow_style=False)

    def parse_text(self, file_path: str) -> str:
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()

    def parse_csv(self, file_path: str) -> str:
        with open(file_path, "r", encoding="utf-8") as f:
            reader = csv.reader(f)
            rows = list(reader)

        return "\n".join([", ".join(row) for row in rows])

