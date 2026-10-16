const NOVA_SHEET_ID = '1uKXjziHhHUaZ-0B623xWJohZVk1X6dHaDG7RUQgvc4A';
function reply(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
function doGet() { return reply({ok: true, service: 'NOVA lead intake'}); }
function doPost(e) {
  let lock;
  try {
    if (!e || !e.postData || e.postData.contents.length > 24000) throw new Error('Invalid request');
    const d = JSON.parse(e.postData.contents);
    if (!d || typeof d !== 'object' || Array.isArray(d)) throw new Error('Invalid request');
    if (d.company_fax) throw new Error('Invalid request');
    const partner = d.form === 'partner-application';
    if (!partner && d.form !== 'early-access') throw new Error('Invalid form');
    const text = (key, max) => {
      const value = d[key] == null ? '' : String(d[key]).trim();
      if (value.length > max) throw new Error('Field too long');
      return value;
    };
    const email = text('email', 254);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) throw new Error('Invalid email');
    const id = text('submission_id', 80);
    if (!/^[a-zA-Z0-9_-]{16,80}$/.test(id)) throw new Error('Invalid submission ID');
    const page = text('page', 2000);
    if (!/^https:\/\/(www\.)?nova-dental\.net(?:[/?#]|$)/.test(page)) throw new Error('Invalid page');
    const stamp = new Date().toISOString();
    let name, headers, row;
    if (partner) {
      const practice = text('practice_name', 200), owner = text('owner_name', 200);
      const phone = text('phone', 60), city = text('city_state', 200);
      const locations = Number(text('locations', 8));
      if (!practice || !owner || !city || phone.replace(/\D/g, '').length < 10 || !Number.isInteger(locations) || locations < 1 || locations > 500) throw new Error('Required partner fields missing');
      name = 'Dental Partners';
      headers = ['Submitted At','Practice Name','Dentist / Owner','Work Email','Phone','City / State','Locations','Member Capacity','Current Membership Plan','Services Offered','Notes','Source','Page'];
      row = [stamp, practice, owner, email, phone, city, locations, text('capacity',100), text('offers_membership',20), 'Orthodontics: '+text('offers_ortho',20), ['Website: '+text('website',500), text('message',4000)].join(' | '), 'nova-dental.net partner form', page];
    } else {
      const first = text('first_name', 100), zip = text('zip', 10);
      if (!first || !/^\d{5}(-\d{4})?$/.test(zip)) throw new Error('Required consumer fields missing');
      name = 'Consumers';
      headers = ['Submitted At','First Name','Last Name','Email','ZIP Code','Phone','Source','Page'];
      row = [stamp, first, text('last_name',100), email, zip, text('phone',60), 'nova-dental.net early access; launch updates: '+text('launch_updates',10), page];
    }
    // Never interpret submitted text as spreadsheet formulas.
    row = row.map(v => typeof v === 'string' && /^[=+\-@\t\r]/.test(v) ? "'" + v : v);
    lock = LockService.getScriptLock();
    lock.waitLock(15000);
    const cache = CacheService.getScriptCache();
    if (cache.get(id)) return reply({ok: true, submission_id: id});
    const sheet = SpreadsheetApp.openById(NOVA_SHEET_ID).getSheetByName(name);
    if (!sheet) throw new Error('Missing destination');
    const actual = sheet.getRange(1,1,1,headers.length).getValues()[0];
    if (actual.some((v,i) => v !== headers[i])) throw new Error('Destination headers changed');
    sheet.appendRow(row);
    SpreadsheetApp.flush();
    cache.put(id, 'saved', 21600);
    return reply({ok: true, submission_id: id});
  } catch (err) {
    // No contact details or internal exception information in public responses.
    return reply({ok: false, error: 'Unable to save submission. Please try again.'});
  } finally {
    if (lock) lock.releaseLock();
  }
}
