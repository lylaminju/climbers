import sqlite3
import json

def export_to_json(db_path, json_path):
    # Connect to the SQLite database
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    # SQL query to retrieve gym information
    cur.execute("SELECT * FROM gyms")

    # Fetch all rows from the result
    rows = cur.fetchall()

    # Get column names from the cursor
    column_names = [description[0] for description in cur.description]

    # Format data to match the required JSON structure
    gyms = []
    for row in rows:
        gym_dict = dict(zip(column_names, row))
        gyms.append({
            "id": gym_dict["id"],
            "name": gym_dict["name"],
            "city": gym_dict["city"],
            "address": gym_dict["address"],
            "mapUrl": gym_dict["map_url"],
            "placeId": gym_dict["place_id"],
            "coordinates": {
                "latitude": gym_dict["latitude"],
                "longitude": gym_dict["longitude"],
            },
            "publicTransport": {
                "subway": {
                    "line": gym_dict["subway_line"],
                    "station": gym_dict["subway_station"]
                } if gym_dict["subway_line"] and gym_dict["subway_station"] else None,
                "busOrTram": bool(gym_dict["bus_tram"])
            },
            "websiteUrl": gym_dict["website_url"],
            "price": {
                "currency": gym_dict["price_currency"],
                "amount": gym_dict["price_amount"],
                "tax": gym_dict["price_tax"],
                "sourceUrl": gym_dict.get("price_source_url")
            },
            "iconUrl": gym_dict["icon_url"],
            "imageUrl": gym_dict["image_url"],
            "area": {
                "unit": gym_dict["area_unit"],
                "value": gym_dict["area_value"]
            },
            "climbingTypes": {
                "boulder": bool(gym_dict["boulder"]),
                "topRope": bool(gym_dict["top_rope"]),
                "lead": bool(gym_dict["lead"]),
                "autoBelay": bool(gym_dict["auto_belay"])
            },
            "boards": {
                "moonBoard": bool(gym_dict["moon_board"]),
                "kilterBoard": bool(gym_dict["kilter_board"])
            }
        })

    # Remove keys with None values in publicTransport
    for gym in gyms:
        if gym["publicTransport"]["subway"] is None:
            del gym["publicTransport"]["subway"]

    # Write data to a JSON file
    with open(json_path, 'w', encoding='utf-8') as json_file:
        json.dump({"gyms": gyms}, json_file, ensure_ascii=False, indent=4)

    # Close the connection
    conn.close()

# Export data
export_to_json("identifier.sqlite", "./src/lib/data/climbing-gyms.json")
print("Database exported to climbing-gyms.json !\n")
