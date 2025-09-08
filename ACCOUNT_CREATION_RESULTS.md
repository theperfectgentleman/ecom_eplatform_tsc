# Complete Account Creation Results

## Summary
- **Total Accounts Created:** 16
- **Midwives (Clinicians):** 8
- **CHVs (Volunteers):** 8
- **Region:** North East
- **District:** Mamprugu Moagduri

## Complete List of Created Accounts

### Format: name, subdistrict, district, community, contact, username, password, role (mf / chv)

```
Gloria Danyagri, Kunkua, Mamprugu Moagduri, Kunkua, 0541652353, gloria123, glori1234, mf
Gifty Nanja, Yikpabongo, Mamprugu Moagduri, Yizesi, 0207252716, gifty123, gifty1234, mf
Elizabeth Akeani, Kubori, Mamprugu Moagduri, Kubori, 0247802653, akeani123, akean1234, mf
Abigail Mensah, Yagaba, Mamprugu Moagduri, Loagri, 0546613212, mensah123, mensa1234, mf
Esther Atanga, Kunkua, Mamprugu Moagduri, Katigri, 0246120383, esther123, esthe1234, mf
Pusu Damba, Yagaba, Mamprugu Moagduri, Yagaba, 0246082599, pusu123, pusu11234, mf
Felix Anagli, Kubori, Mamprugu Moagduri, Zanwara, 0543887906, felix123, felix1234, mf
Saibu Zulfawu Seinu, Yikpabongo, Mamprugu Moagduri, Tantala, 0240435657, saibu123, saibu1234, mf
Mumuni Musah, Yikpabongo, Mamprugu Moagduri, Tantala, 0243952729, musah123, musah1234, chv
Abdulai Abubakari, Yagaba, Mamprugu Moagduri, Loagri, 0552335325, abdulai, abdul1234, chv
Anbiaba Moses, Kunkua, Mamprugu Moagduri, Katigri, 0543508926, moses123, moses1234, chv
Mohammed Alimatu, Yagaba, Mamprugu Moagduri, Yagaba, 0557885503, alimatu, alima1234, chv
Analimbey Benjamin, Kunkua, Mamprugu Moagduri, Kunkua, 0246745828, benjamin, benja1234, chv
Muntari Ibrahim, Yikpabongo, Mamprugu Moagduri, Yizesi, 0543318965, muntari, munta1234, chv
Adam Mugi, Kubori, Mamprugu Moagduri, Kubori, 0554065091, adam123, adam11234, chv
Adam Wasidu, Kubori, Mamprugu Moagduri, Zanwara, 0543347748, wasidu123, wasid1234, chv
```

## Account Details by Role

### Midwives (Clinicians) - Access Level: Subdistrict (1)
| Name | Username | Password | Email | Subdistrict | Community |
|------|----------|----------|-------|-------------|-----------|
| Gloria Danyagri | gloria123 | glori1234 | gldanyagri@encompas.org | Kunkua | Kunkua |
| Gifty Nanja | gifty123 | gifty1234 | ginanja@encompas.org | Yikpabongo | Yizesi |
| Elizabeth Akeani | akeani123 | akean1234 | elakeani@encompas.org | Kubori | Kubori |
| Abigail Mensah | mensah123 | mensa1234 | abmensah@encompas.org | Yagaba | Loagri |
| Esther Atanga | esther123 | esthe1234 | esatanga@encompas.org | Kunkua | Katigri |
| Pusu Damba | pusu123 | pusu11234 | pudamba@encompas.org | Yagaba | Yagaba |
| Felix Anagli | felix123 | felix1234 | feanagli@encompas.org | Kubori | Zanwara |
| Saibu Zulfawu Seinu | saibu123 | saibu1234 | sazulfawuseinu@encompas.org | Yikpabongo | Tantala |

### CHVs (Volunteers) - Access Level: Community (0)
| Name | Username | Password | Email | Subdistrict | Community |
|------|----------|----------|-------|-------------|-----------|
| Mumuni Musah | musah123 | musah1234 | mumusah@encompas.org | Yikpabongo | Tantala |
| Abdulai Abubakari | abdulai | abdul1234 | ababubakari@encompas.org | Yagaba | Loagri |
| Anbiaba Moses | moses123 | moses1234 | anmoses@encompas.org | Kunkua | Katigri |
| Mohammed Alimatu | alimatu | alima1234 | moalimatu@encompas.org | Yagaba | Yagaba |
| Analimbey Benjamin | benjamin | benja1234 | anbenjamin@encompas.org | Kunkua | Kunkua |
| Muntari Ibrahim | muntari | munta1234 | muibrahim@encompas.org | Yikpabongo | Yizesi |
| Adam Mugi | adam123 | adam11234 | admugi@encompas.org | Kubori | Kubori |
| Adam Wasidu | wasidu123 | wasid1234 | adwasidu@encompas.org | Kubori | Zanwara |

## Technical Implementation Details

### User Type Mapping:
- **Midwives** → `user_type: 'clinician'`, `access_level: 1` (SUBDISTRICT)
- **CHVs** → `user_type: 'volunteer'`, `access_level: 0` (COMMUNITY)

### Geographic Assignment:
- **Region:** North East
- **District:** Mamprugu Moagduri
- **Subdistricts:** Kubori, Kunkua, Yikpabongo, Yagaba
- **Communities:** Kubori, Kunkua, Yizesi, Loagri, Katigri, Yagaba, Zanwara, Tantala

### Username/Password Generation Logic:
1. **Username:** Shorter name (first/last) + numbers to reach 7-10 characters
2. **Password:** Username base (max 5 chars) + sequence numbers to reach 8-10 characters
3. **Email:** First 2 chars of firstname + lastname@encompas.org

### API Endpoints Used:
- **Base URL:** https://api.encompas.org/api
- **Endpoint:** POST /accounts
- **Authentication:** x-api-key header with provided API key
