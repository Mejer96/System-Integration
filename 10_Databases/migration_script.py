import pymysql
import pymongo
from pymongo import MongoClient

# MySQL connection setup
mysql_conn = pymysql.connect(
    host='localhost',
    port=3306,
    user='root',
    password='##Heisenberg##',
    database='cinema_booking'
)

# MongoDB connection setup
mongo_client = MongoClient("mongodb://localhost:27017/")
mongo_db = mongo_client['MovieDB']
mongo_movies = mongo_db['movies']

def migrate_movie(movie_id):
    with mysql_conn.cursor(pymysql.cursors.DictCursor) as cursor:
        # Fetch movie info
        cursor.execute("SELECT * FROM Movies WHERE Id=%s", (movie_id,))
        movie = cursor.fetchone()
        if not movie:
            print(f"No movie found with Id={movie_id}")
            return

        # Fetch director
        cursor.execute("SELECT FirstName, LastName FROM Directors WHERE Id=%s", (movie['DirectorId'],))
        director = cursor.fetchone()
        if not director:
            print(f"No director found for movie Id={movie_id}")
            return

        # Fetch genres
        cursor.execute("""
            SELECT g.Name 
            FROM Genres g
            JOIN GenreEntityMovieEntity mg ON g.Id = mg.GenresId
            WHERE mg.MoviesId = %s
        """, (movie_id,))
        genres = cursor.fetchall()
        genre_docs = [{"Title": g['Name']} for g in genres]

        # Fetch actors
        cursor.execute("""
            SELECT a.FirstName, a.LastName
            FROM Actors a
            JOIN ActorEntityMovieEntity am ON a.Id = am.ActorsId
            WHERE am.MoviesId = %s
        """, (movie_id,))
        actors = cursor.fetchall()
        actor_docs = [{"FirstName": a['FirstName'], "LastName": a['LastName']} for a in actors]

        # Construct MongoDB document
        mongo_doc = {
            "Title": movie['Title'],
            "Summary": movie['Summary'],
            "Runtime": movie['RuntimeMinutes'],
            "IMDBRating": float(movie['IMDBRating']),
            "Year": movie['Year'],
            "Director": {
                "FirstName": director['FirstName'],
                "LastName": director['LastName']
            },
            "Genres": genre_docs,
            "Actors": actor_docs
        }

        # Insert into MongoDB
        mongo_movies.insert_one(mongo_doc)
        print(f"Movie '{movie['Title']}' migrated to MongoDB.")



if __name__ == "__main__":
    migrate_movie(1)

    mysql_conn.close()
    mongo_client.close()
