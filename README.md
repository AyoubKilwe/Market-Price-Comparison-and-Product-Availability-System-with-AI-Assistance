# Market Price Comparison and Product Availability System with AI Assistance

**Live Demo:** https://frontend-production-c87c.up.railway.app/

## Dulmar kooban (Overview)
Mashruucan waa nidaam isbarbardhig qiimo iyo helitaan badeecooyin oo wata caawimaad AI. Waxay u oggolaanaysaa isticmaalayaasha iyo ganacsatada inay:

- Ka helaan qiimayaal isbarbar socda suuqyada kala duwan
- Ka ogaadaan helitaanka alaabta (availability)
- Helaan talooyin iyo jawaabo AI-led ah si loo sahlanaado go'aan qaadashada

## Muhiimadda Mashruuca
Mashruucan wuxuu fududeeyaa in la ogaado meesha ugu fiican ee badeeco laga iibsado, isla markaana bixiya xog-waqtiga-dhabta ah oo ku saabsan helitaanka alaabta iyo isbeddelka qiimaha.

## Qaybaha Mashruuca
- `backend/`: API server (Node.js + Express)
- `frontend/`: React app (Vite) + design assets

## Astaamaha (Features)
- Isbarbardhig qiimaha badeecadaha
- Raadinta helitaanka (availability) dukaamo kala duwan
- Dashboor kala duwan: macmiil, iibiyaha
- AI assistant (controller: `controllers/aiController.js`) oo bixin karta talooyin iyo su'aalo jawaabo

## Teknolojiyada la Isticmaalay
- Node.js, Express
- MongoDB (config: `backend/config/db.js`)
- React + Vite
- Gemini service integration (see `backend/services/geminiService.js`)

## Sida Loo Socodsiiyo (Local Setup)
1. Clone repository-ga:

   git clone <your-repo-url>

2. Backend:

   cd backend
   npm install
   npm run start

3. Frontend:

   cd frontend
   npm install
   npm run dev

4. DB: Update `backend/config/db.js` with connection string.

## Sidee u Shaqeyso (How it works)
- Frontend wuxuu wacaa API-ga backend-ka si uu u helo liiska badeecooyinka iyo helitaanka.
- Backend-ku wuxuu ku xiran yahay ilo xogeedyo kala duwan (listings, shops) iyo adeeg AI oo bixiya talooyinka.

## Screenshots (Design)
Hoos ka heli sawirro ka turjumaya qaybaha frontend-ka (Design/Screens):

![Landing Page](frontend/Design/Screens/landing-page.png)
![Product Catalog](frontend/Design/Screens/product-catalog.jpg)
![Product List](frontend/Design/Screens/product-list.png)
![Customer Dashboard](frontend/Design/Screens/customer-dashboard.png)
![Vendor Dashboard](frontend/Design/Screens/vendor-dashboard.png)

## Faylasha Muhiimka ah
- `backend/server.js` — Entry point backend
- `backend/controllers/` — API controllers
- `frontend/src/` — React source

## Live Deployment
Mashruucu waa online: https://frontend-production-c87c.up.railway.app/

## Contributing
- Fadlan samee fork, samee branch cusub, kadib PR.

## License
- Eeg `LICENSE` haddii uu jiro ama la xiriir milkiilaha mashruuca.

---
_Waxaa diyaariyey: README auto-generated and polished._
# Market-Price-Comparison-and-Product-Availability-System-with-AI-Assistance
MERN full-stack market price comparison and product availability platform for Hargeisa, featuring nearby shops, price alerts, market trends, vendor management, and AI assistance. Developed collaboratively
