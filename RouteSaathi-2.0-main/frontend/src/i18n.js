import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
    en: {
        translation: {
            "welcome": "Welcome Back",
            "login": "Login",
            "email": "Email Address",
            "password": "Password",
            "signing_in": "Signing in...",
            "use_as_passenger": "Use as Passenger",
            "demo_credentials": "Demo Credentials",
            "coordinator": "Coordinator",
            "conductor": "Conductor",
            "passenger": "Passenger",
            "logout": "Logout",
            "track": "Track",
            "my_tickets": "My Tickets",
            "sos": "SOS",
            "analytics": "Analytics",
            "dashboard": "Dashboard",
            "ai_recommendations": "AI Recommendations",
            "live_tracking": "Live Tracking",
            "broadcast": "Broadcast",
            "emergency_sos": "Emergency SOS",
            "confirm_emergency": "Confirm Emergency",
            "cancel": "Cancel",
            "send_sos": "Send SOS",
            "where_to": "Where do you want to go?",
            "search": "Search",
            "nearby_buses": "Nearby Buses",
            "active_buses": "Active Buses",
            "high_demand": "High Demand",
            "low_demand": "Low Demand",
            "ai_actions": "AI Actions",
            "recent_alerts": "Recent Alerts",
            "quick_actions": "Quick Actions",
            "view_all": "View All"
        }
    },
    kn: {
        translation: {
            "welcome": "ಮರಳಿ ಸುಸ್ವಾಗತ",
            "login": "ಲಾಗಿನ್",
            "email": "ಇಮೇಲ್ ವಿಳಾಸ",
            "password": "ಪಾಸ್‌ವರ್ಡ್",
            "signing_in": "ಸೈನ್ ಇನ್ ಆಗುತ್ತಿದೆ...",
            "use_as_passenger": "ಪ್ರಯಾಣಿಕರಾಗಿ ಬಳಸಿ",
            "demo_credentials": "ಡೆಮೊ ರುಜುವಾತುಗಳು",
            "coordinator": "ಸಂಯೋಜಕರು",
            "conductor": "ನಿರ್ವಾಹಕರು",
            "passenger": "ಪ್ರಯಾಣಿಕರು",
            "logout": "ಲಾಗ್ ಔಟ್",
            "track": "ಟ್ರ್ಯಾಕ್",
            "my_tickets": "ನನ್ನ ಟಿಕೆಟ್‌ಗಳು",
            "sos": "ಎಸ್.ಒ.ಎಸ್ (SOS)",
            "analytics": "ವಿಶ್ಲೇಷಣೆ",
            "dashboard": "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
            "ai_recommendations": "AI ಶಿಫಾರಸುಗಳು",
            "live_tracking": "ಲೈವ್ ಟ್ರ್ಯಾಕಿಂಗ್",
            "broadcast": "ಪ್ರಸಾರ",
            "emergency_sos": "ತುರ್ತು ಎಸ್.ಒ.ಎಸ್",
            "confirm_emergency": "ತುರ್ತು ಪರಿಸ್ಥಿತಿಯನ್ನು ಖಚಿತಪಡಿಸಿ",
            "cancel": "ರದ್ದುಮಾಡಿ",
            "send_sos": "ಎಸ್.ಒ.ಎಸ್ ಕಳುಹಿಸಿ",
            "where_to": "ನೀವು ಎಲ್ಲಿಗೆ ಹೋಗಲು ಬಯಸುತ್ತೀರಿ?",
            "search": "ಹುಡುಕಿ",
            "nearby_buses": "ಹತ್ತಿರದ ಬಸ್‌ಗಳು",
            "active_buses": "ಸಕ್ರಿಯ ಬಸ್‌ಗಳು",
            "high_demand": "ಹೆಚ್ಚಿನ ಬೇಡಿಕೆ",
            "low_demand": "ಕಡಿಮೆ ಬೇಡಿಕೆ",
            "ai_actions": "AI ಕ್ರಮಗಳು",
            "recent_alerts": "ಇತ್ತೀಚಿನ ಎಚ್ಚರಿಕೆಗಳು",
            "quick_actions": "ತ್ವರಿತ ಕ್ರಮಗಳು",
            "view_all": "ಎಲ್ಲವನ್ನೂ ನೋಡಿ"
        }
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
