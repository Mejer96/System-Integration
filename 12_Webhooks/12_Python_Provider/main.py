from fastapi import FastAPI, HTTPException, Request
import json
import os
import requests
from datetime import datetime, timezone

app = FastAPI()

FILES = {
    "released": "callbacks_release.json",
    "announcement": "callbacks_announcement.json",
    "reservation": "callbacks_reservation.json"
}


def load_callbacks(file_path):
    if not os.path.exists(file_path):
        return []
    with open(file_path, "r") as f:
        return json.load(f)

def save_callbacks(file_path, callbacks):
    with open(file_path, "w") as f:
        json.dump(callbacks, f, indent=2)

def register_callback(file_path, callback):
    callbacks = load_callbacks(file_path)
    if callback not in callbacks:
        callbacks.append(callback)
        save_callbacks(file_path, callbacks)

def unregister_callback(file_path, username, url):
    callbacks = load_callbacks(file_path)
    updated = [cb for cb in callbacks if not (cb["user"] == username and cb["url"] == url)]
    if len(callbacks) == len(updated):
        raise HTTPException(status_code=404, detail="Callback not found")
    save_callbacks(file_path, updated)

def send_webhook(file_path, payload):
    callbacks = load_callbacks(file_path)
    for cb in callbacks:
        try:
            response = requests.post(cb["url"], json=payload, timeout=5)
            response.raise_for_status()
        except requests.exceptions.RequestException as e:
            print(f"Failed to send to {cb['url']}: {e}")


@app.post("/movie/announcement")
async def movie_announced(request: Request):
    data = await request.json()
    payload = {
        "event": "movie_announcement",
        "message": f"{data['title']} is in production and will be directed by {data['director']}",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    send_webhook(FILES["announcement"], payload)
    return {"message": "Movie announcement made!"}

@app.post("/movie/released")
async def movie_released(request: Request):
    data = await request.json()
    payload = {
        "event": "movie_released",
        "message": f"{data['title']} is now in theaters!",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    send_webhook(FILES["released"], payload)
    return {"message": "Movie release has been pushed!"}

@app.post("/movie/reservation")
async def movie_reservation_made(request: Request):
    data = await request.json()
    payload = {
        "event": "movie_reservation",
        "message": f"Movie reservation made for {data['title']} by {data['user']}",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    send_webhook(FILES["reservation"], payload)
    return {"message": "Reservation made!"}


@app.post("/movie/announcement/register")
async def register_movie_announcement(request: Request):
    data = await request.json()
    url = data.get("callback_url")
    username = data.get("username")
    if not url or not username:
        raise HTTPException(status_code=400, detail="callback_url or username missing")
    register_callback(FILES["announcement"], {"user": username, "url": url})
    return {"status": "registered", "user": username, "url": url}

@app.post("/movie/release/register")
async def register_movie_released(request: Request):
    data = await request.json()
    url = data.get("callback_url")
    username = data.get("username")
    if not url or not username:
        raise HTTPException(status_code=400, detail="callback_url or username missing")
    register_callback(FILES["released"], {"user": username, "url": url})
    return {"status": "registered", "user": username, "url": url}

@app.post("/movie/reservation/register")
async def register_movie_reservation(request: Request):
    data = await request.json()
    url = data.get("callback_url")
    username = data.get("username")
    if not url or not username:
        raise HTTPException(status_code=400, detail="callback_url or username missing")
    register_callback(FILES["reservation"], {"user": username, "url": url})
    return {"status": "registered", "user": username, "url": url}


@app.post("/movie/announcement/unregister")
async def unregister_movie_announcement(request: Request):
    data = await request.json()
    username = data.get("username")
    url = data.get("callback_url")
    if not username or not url:
        raise HTTPException(status_code=400, detail="username or callback_url missing")
    unregister_callback(FILES["announcement"], username, url)
    return {"status": "unregistered", "user": username, "url": url}

@app.post("/movie/release/unregister")
async def unregister_movie_release(request: Request):
    data = await request.json()
    username = data.get("username")
    url = data.get("callback_url")
    if not username or not url:
        raise HTTPException(status_code=400, detail="username or callback_url missing")
    unregister_callback(FILES["released"], username, url)
    return {"status": "unregistered", "user": username, "url": url}

@app.post("/movie/reservation/unregister")
async def unregister_movie_reservation(request: Request):
    data = await request.json()
    username = data.get("username")
    url = data.get("callback_url")
    if not username or not url:
        raise HTTPException(status_code=400, detail="username or callback_url missing")
    unregister_callback(FILES["reservation"], username, url)
    return {"status": "unregistered", "user": username, "url": url}





# from fastapi import FastAPI, HTTPException, Request
# import json
# import os
# import requests
# from datetime import datetime, timezone
# app = FastAPI()

# FILES = {
#     "released": "callbacks_release.json",
#     "announcement": "callbacks_announcement.json",
#     "reservation": "callback_reservation.json"
# }

# def load_callbacks(file_path):
#     if not os.path.exists(file_path):
#         return []
#     with open(file_path, "r") as f:
#         return json.load(f)

# def save_callbacks(file_path, urls):
#     with open(file_path, "w") as f:
#         json.dump(urls, f, indent=2)

# def register_callback(file_path, url):
#     urls = load_callbacks(file_path)
#     if url not in urls:
#         urls.append(url)
#         save_callbacks(file_path, urls)

# @app.post("/movie/released")
# async def movie_released(request: Request):
#     data = await request.json()
#     payload = {
#         "event": "movie premiered",
#         "message": f"{data["title"]} is now in theaters!",
#         "timestamp": datetime.now(timezone.utc).isoformat()
#         }
#     send_webhook(FILES["released"], payload)

#     return {"message": "Movie release has been pushed!"}

# @app.post("/movie/announcement")
# async def movie_announced(request: Request):
#     data = await request.json() 
#     payload = {
#         "event": "movie announcement",
#         "message": f"{data["title"]} is in production and will be directed by {data["director"]}",
#         "timestamp": datetime.now(timezone.utc).isoformat() 
#         }
#     send_webhook(FILES["announcement"], payload)    
#     return {"message": "Movie announcement made!"}

# @app.post("/movie/reservation")
# async def movie_reservation_made(request: Request):
#     data = await request.json()
#     payload = {
#         "event": "movie reservation",
#         "message": f"Movie reservation made for {data["title"]} by {data["user"]}",
#         "timestamp": datetime.now(timezone.utc).isoformat()
#         }
#     send_webhook(FILES["reservation"], payload)

#     return {"message": "Reservation made!"}

# @app.post("/movie/release/register")
# async def register_movie_released(request: Request):
#     data = await request.json()
#     url = data.get("callback_url")
#     username = data.get("username")
#     if not url or username:
#         raise HTTPException(status_code=400, detail="callback_url or username missing")
    
#     register_callback(FILES["released"], {"user": username, "url": url})
#     return {"status": "registered", "url": url, "user": username}

# @app.post("/movie/announcement/register")
# async def register_movie_announcement(request: Request):
#     data = await request.json()
#     url = data.get("callback_url")
#     username = data.get("username")
#     if not url or username:
#         raise HTTPException(status_code=400, detail="callback_url or username missing")
    
#     register_callback(FILES["announcement"], {"user": username, "url": url})
#     return {"status": "registered", "url": url, "user": username}

# @app.post("/movie/reservation/register")
# async def register_movie_reservation(request: Request):
#     data = await request.json()
#     url = data.get("callback_url")
#     username = data.get("username")
#     if not url or username:
#         raise HTTPException(status_code=400, detail="callback_url or username missing or username")
    
#     register_callback(FILES["reservation"], {"user": username, "url": url})
#     return {"status": "registered", "url": url, "user": username}


# def send_webhook(file_path, payload):
#     urls = load_callbacks(file_path)
#     for url in urls:
#         try:
#             response = requests.post(url, json=payload, timeout=5)
#             response.raise_for_status()
#         except requests.exceptions.RequestException as e:
#             print(f"Failed to send to {url}: {e}")



