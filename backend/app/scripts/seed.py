from app.db import SessionLocal
from app.services.seed_service import seed_demo_data


def main():
    db = SessionLocal()
    try:
        summary = seed_demo_data(db)
        print("Demo seed completed.")
        print(summary)
    finally:
        db.close()


if __name__ == "__main__":
    main()