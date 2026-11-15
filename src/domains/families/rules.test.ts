// cspell:ignore Haider Hasan Hyder Imran Zahra عمران
// Run with `pnpm test` (node --test; Node strips the types, so no build is needed). Every name and number is made up.
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  ageOn,
  byBirthOrder,
  earlierSchools,
  errorCode,
  firstFew,
  firstName,
  formatPhone,
  isFamilyQueryKey,
  householdHeader,
  initials,
  normalizePhone,
  orderReasons,
  pairKey,
  partBand,
  pctOf,
  queryKind,
  resultBand,
  sessionSpan,
} from './rules.ts';

describe('phones', () => {
  it('keeps the last 10 digits', () => {
    assert.equal(normalizePhone('0300-1234567'), '3001234567');
    assert.equal(normalizePhone('+92 300 1234567'), '3001234567');
    assert.equal(normalizePhone('1234567'), '1234567');
    assert.equal(normalizePhone(null), '');
  });

  it('formats a mobile number for reading', () => {
    assert.equal(formatPhone('03001234567'), '0300 1234567');
    assert.equal(formatPhone('923001234567'), '0300 1234567');
    assert.equal(formatPhone(' 021-111 '), '021-111');
  });
});

describe('query kind', () => {
  it('reads digits as a phone', () => {
    assert.equal(queryKind('0300 1234567'), 'PHONE');
    assert.equal(queryKind('1234567'), 'PHONE');
  });

  it('reads letters as a name', () => {
    assert.equal(queryKind('Imran Haider'), 'FATHER_NAME');
    assert.equal(queryKind('عمران'), 'FATHER_NAME');
  });

  it('reads dashes as a GR', () => {
    assert.equal(queryKind('9221-1-012-000101'), 'GR');
  });

  it('asks for more when too short', () => {
    assert.equal(queryKind('12345'), 'TOO_SHORT');
    assert.equal(queryKind('Al'), 'TOO_SHORT');
    assert.equal(queryKind('   '), 'TOO_SHORT');
  });
});

describe('birth order and ages', () => {
  it('lists the eldest first, children with no birth date last', () => {
    const kids = [
      { name: 'Hasan', dateOfBirth: '2018-01-01' },
      { name: 'Nadia' },
      { name: 'Zahra', dateOfBirth: '2012-05-05' },
      { name: 'Ali', dateOfBirth: '2014-03-02' },
    ];
    assert.deepEqual(
      [...kids].sort(byBirthOrder).map((k) => k.name),
      ['Zahra', 'Ali', 'Hasan', 'Nadia'],
    );
  });

  it('counts whole years', () => {
    const now = new Date(Date.UTC(2026, 10, 15));
    assert.equal(ageOn('2014-03-02', now), 12);
    assert.equal(ageOn('2014-11-16T00:00:00.000Z', now), 11);
    assert.equal(ageOn('2014-11-15', now), 12);
    assert.equal(ageOn(undefined, now), undefined);
  });

  it('takes first names and initials', () => {
    assert.equal(firstName('  Ali  Imran '), 'Ali');
    assert.equal(initials('imran haider khan'), 'IH');
    assert.equal(initials(''), '');
  });
});

describe('household header', () => {
  it('uses the most common father name, phone, area and address', () => {
    const area = { id: 'a1', code: '012', name: 'Example Town' };
    const other = { id: 'a2', code: '013', name: 'Sample Colony' };
    const header = householdHeader([
      { fatherName: 'Imran Haider', phone: '0300-1234567', area, address: 'House 1' },
      { fatherName: 'imran  haider', phone: '+923001234567', alternatePhone: '03211234567', area, address: 'house 1' },
      { fatherName: 'Imran Hyder', phone: '03211234567', area: other, address: 'House 2' },
    ]);
    assert.equal(header.fatherName, 'Imran Haider');
    assert.deepEqual(header.otherFatherNames, ['Imran Hyder']);
    assert.deepEqual(header.phones, ['0300-1234567', '03211234567']);
    assert.equal(header.area?.id, 'a1');
    assert.equal(header.moreAreas, 1);
    assert.equal(header.address, 'House 1');
    assert.equal(header.moreAddresses, 1);
  });

  it('copes with nothing known', () => {
    const header = householdHeader([{}]);
    assert.equal(header.fatherName, undefined);
    assert.deepEqual(header.phones, []);
    assert.equal(header.moreAreas, 0);
  });
});

describe('reasons', () => {
  it('says them in a fixed order and drops "similar" next to "same"', () => {
    assert.deepEqual(orderReasons(['SIMILAR_FATHER_NAME', 'SHARED_PHONE']), ['SHARED_PHONE', 'SIMILAR_FATHER_NAME']);
    assert.deepEqual(orderReasons(['SAME_AREA', 'SIMILAR_FATHER_NAME', 'SAME_FATHER_NAME']), [
      'SAME_FATHER_NAME',
      'SAME_AREA',
    ]);
    assert.deepEqual(orderReasons(['NEW_REASON', 'SHARED_PHONE']), ['SHARED_PHONE', 'NEW_REASON']);
  });
});

describe('result tint', () => {
  it('bands a passed result by its percentage', () => {
    assert.equal(resultBand({ admitted: true, status: 'PASS', pct: 91 }), 'HIGH');
    assert.equal(resultBand({ admitted: true, status: 'PASS', pct: 85 }), 'HIGH');
    assert.equal(resultBand({ admitted: true, status: 'PASS', pct: 78 }), 'GOOD');
    assert.equal(resultBand({ admitted: true, status: 'PASS', pct: 62 }), 'LOW');
  });

  it('marks fail, terminated, no result and not admitted', () => {
    assert.equal(resultBand({ admitted: true, status: 'FAIL', pct: 41 }), 'FAIL');
    assert.equal(resultBand({ admitted: true, status: 'TERMINATED' }), 'TERMINATED');
    assert.equal(resultBand({ admitted: true, status: null }), 'NO_RESULT');
    assert.equal(resultBand({ admitted: false }), 'NOT_ADMITTED');
    assert.equal(resultBand(undefined), 'NOT_ADMITTED');
  });

  it('bands parts by score only', () => {
    assert.equal(partBand(90), 'HIGH');
    assert.equal(partBand(40), 'LOW');
    assert.equal(partBand(null), 'NO_RESULT');
  });

  it('rounds percentages', () => {
    assert.equal(pctOf(41, 50), 82);
    assert.equal(pctOf(10, 0), undefined);
    assert.equal(pctOf(null, 100), undefined);
  });
});

describe('earlier schools', () => {
  it('lists other schools before the latest, newest first, with their sessions', () => {
    const stints = earlierSchools([
      { sessionName: 'DR1443', schoolName: 'Example Public School' },
      { sessionName: 'DR1444', schoolName: 'example public  school' },
      { sessionName: 'DR1445', schoolName: 'Sample Academy' },
      { sessionName: 'DR1446', schoolName: null },
      { sessionName: 'DR1447', schoolName: 'Example Grammar School' },
    ]);
    assert.deepEqual(stints, [
      { name: 'Sample Academy', first: 'DR1445', last: 'DR1445' },
      { name: 'Example Public School', first: 'DR1443', last: 'DR1444' },
    ]);
    assert.equal(sessionSpan(stints[1]!), 'DR1443–DR1444');
    assert.equal(sessionSpan(stints[0]!), 'DR1445');
  });

  it('has nothing when the school never changed', () => {
    assert.deepEqual(
      earlierSchools([
        { sessionName: 'DR1446', schoolName: 'Example Grammar School' },
        { sessionName: 'DR1447', schoolName: 'Example Grammar School' },
      ]),
      [],
    );
  });
});

describe('small helpers', () => {
  it('keys a pair either way round', () => {
    assert.equal(pairKey('b', 'a'), pairKey('a', 'b'));
  });

  it('shows the first few', () => {
    assert.deepEqual(firstFew([1, 2, 3, 4, 5, 6], 4), { shown: [1, 2, 3, 4], more: 2 });
    assert.deepEqual(firstFew([1], 4), { shown: [1], more: 0 });
  });
});

describe('family query keys', () => {
  it('matches the generated routes and our own keys', () => {
    assert.equal(isFamilyQueryKey(['/admin/families/students/s1', { includeWeak: true }]), true);
    assert.equal(isFamilyQueryKey(['/admin/families']), true);
    assert.equal(isFamilyQueryKey(['families', 'child-sessions', ['s1']]), true);
  });

  it('leaves other queries alone', () => {
    assert.equal(isFamilyQueryKey(['/students/s1/profile']), false);
    assert.equal(isFamilyQueryKey(['familiesX']), false);
    assert.equal(isFamilyQueryKey([]), false);
  });
});

describe('error codes', () => {
  it('reads the code from an API error body', () => {
    assert.equal(errorCode({ statusCode: 400, message: 'x', code: 'POSSIBLE_DUPLICATE' }), 'POSSIBLE_DUPLICATE');
    assert.equal(errorCode({ error: { code: 'SAME_FAMILY' } }), 'SAME_FAMILY');
    assert.equal(errorCode(new Error('x')), undefined);
    assert.equal(errorCode(null), undefined);
  });
});
