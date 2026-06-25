##Backend 
cd backend (go to the backend folder)
python -m venv venv
venv/Scripts/activate (Create a virtual enviornment)
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8000

******* Frontend *************
cd frontend (go to the frontend)
npm install
npm run dev
