import { useState } from 'react';

import {
    BibleMinimalInfoType,
} from '../../helper/bible-helpers/bibleDownloadHelpers';
import { getLangCode } from '../../lang';

function BibleKeyXMLInputComp({
    defaultVale, onChange, guessingKeys, downloadedBibleInfoList,
}: Readonly<{
    defaultVale: string, onChange: (key: string) => void,
    guessingKeys?: string[],
    downloadedBibleInfoList: BibleMinimalInfoType[],
}>) {
    const takenKeys = downloadedBibleInfoList.map((bible) => {
        return bible.key.toLowerCase();
    });
    const [value, setValue] = useState(defaultVale);
    const [invalidMessage, setInvalidMessage] = useState<string>('');
    const setValue1 = (value: string) => {
        setValue(value);
        onChange(value);
        if (takenKeys.includes(value.toLowerCase())) {
            setInvalidMessage('Key is already taken');
        } else {
            setInvalidMessage('');
        }
    };
    return (
        <div className='w-100 h-100'>
            <div>Define a Bible key</div>
            <div className='input-group'
                title={invalidMessage}>
                <div className='input-group-text'>Key:</div>
                <input className={
                    'form-control' + (invalidMessage ? ' is-invalid' : '')
                }
                    type='text' value={value}
                    onChange={(e) => {
                        setValue1(e.target.value);
                    }}
                />
            </div>
            {guessingKeys !== undefined && guessingKeys.length > 0 ? (
                <div className='w-100'>
                    <div>Guessing keys:</div>
                    <div>
                        {guessingKeys.map((guessingKey) => {
                            if (
                                takenKeys.includes(guessingKey.toLowerCase()) ||
                                guessingKey === value
                            ) {
                                return null;
                            }
                            return (
                                <button key={guessingKey}
                                    className='btn btn-sm btn-outline-info m-1'
                                    onClick={() => {
                                        setValue1(guessingKey);
                                    }}>
                                    {guessingKey}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ) : null}
        </div>
    );
}

export function genBibleKeyXMLInput(
    key: string, onChange: (key: string) => void,
    downloadedBibleInfoList: BibleMinimalInfoType[],
    guessingKeys?: string[],
) {
    return (
        <BibleKeyXMLInputComp
            downloadedBibleInfoList={downloadedBibleInfoList}
            defaultVale={key} onChange={onChange}
            guessingKeys={guessingKeys}
        />
    );
}

function BibleNumbersMapXMLInputComp({
    defaultVale, onChange, locale,
}: Readonly<{
    defaultVale: string, onChange: (key: string) => void,
    locale: string,
}>) {
    const [value, setValue] = useState(defaultVale);
    const [invalidMessage, setInvalidMessage] = useState<string>('');
    const setValue1 = (value: string) => {
        setValue(value);
        onChange(value);
        if (value.split(' ').length !== 10) {
            setInvalidMessage('Must have 10 numbers');
        } else {
            setInvalidMessage('');
        }
    };
    const langCode = getLangCode(locale) || 'en';
    return (
        <div className='w-100 h-100'>
            <div>Define numbers map</div>
            <div className='input-group'
                title={invalidMessage}>
                <div className='input-group-text'>Key:</div>
                <input className={
                    'form-control' + (invalidMessage ? ' is-invalid' : '')
                }
                    type='text' value={value}
                    onChange={(e) => {
                        setValue1(e.target.value);
                    }}
                />
            </div>
            <div className='w-100'>
                <a className='btn btn-secondary ms-2' href={
                    `https://translate.google.com/?sl=en&tl=${langCode}&` +
                    'text=0%201%202%203%204%205%206%207%208%209&op=translate'
                } target='_blank'>
                    Translate
                </a>
            </div>
        </div>
    );
}

export function genBibleNumbersMapXMLInput(
    numbers: string[], locale: string, onChange: (numbers: string[]) => void,
) {
    return (
        <BibleNumbersMapXMLInputComp
            defaultVale={numbers.join(' ')}
            onChange={(newValue) => {
                onChange(newValue.split(' '));
            }}
            locale={locale}
        />
    );
}

function BibleBooksMapXMLInputComp({
    defaultVale, onChange, locale,
}: Readonly<{
    defaultVale: string, onChange: (key: string) => void,
    locale: string,
}>) {
    const [value, setValue] = useState(defaultVale);
    const [invalidMessage, setInvalidMessage] = useState<string>('');
    const setValue1 = (value: string) => {
        setValue(value);
        onChange(value);
        if (value.split('\n').length !== 66) {
            setInvalidMessage('Must have 66 books');
        } else {
            setInvalidMessage('');
        }
    };
    const langCode = getLangCode(locale) || 'en';
    return (
        <div className='w-100 h-100'>
            <div>Define books map</div>
            <div className='input-group'
                title={invalidMessage}>
                <textarea style={{
                    width: '100%',
                    height: '400px',
                }} className={
                    'form-control' + (invalidMessage ? ' is-invalid' : '')
                } value={value}
                    onChange={(e) => {
                        setValue1(e.target.value);
                    }}
                />
            </div>
            <div className='w-100'>
                <a className='btn btn-secondary ms-2' href={
                    `https://translate.google.com/?sl=en&tl=${langCode}&` +
                    'text=GENESIS%0AEXODUS%0ALEVITICUS%0ANUMBERS%0ADEUTERONO' +
                    'MY%0AJOSHUA%0AJUDGES%0ARUTH%0A1%20SAMUEL%0A2%20SAMUEL%0A' +
                    '1%20KINGS%0A2%20KINGS%0A1%20CHRONICLES%0A2%20CHRONICLES%' +
                    '0AEZRA%0ANEHEMIAH%0AESTHER%0AJOB%0APSALM%0APROVERBS%0AEC' +
                    'CLESIASTES%0ASONG%20OF%20SOLOMON%0AISAIAH%0AJEREMIAH%0A' +
                    'LAMENTATIONS%0AEZEKIEL%0ADANIEL%0AHOSEA%0AJOEL%0AAMOS%0' +
                    'AOBADIAH%0AJONAH%0AMICAH%0ANAHUM%0AHABAKKUK%0AZEPHANIAH' +
                    '%0AHAGGAI%0AZECHARIAH%0AMALACHI%0AMATTHEW%0AMARK%0ALUKE' +
                    '%0AJOHN%0AACTS%0AROMANS%0A1%20CORINTHIANS%0A2%20CORINTH' +
                    'IANS%0AGALATIANS%0AEPHESIANS%0APHILIPPIANS%0ACOLOSSIANS' +
                    '%0A1%20THESSALONIANS%0A2%20THESSALONIANS%0A1%20TIMOTHY%' +
                    '0A2%20TIMOTHY%0ATITUS%0APHILEMON%0AHEBREWS%0AJAMES%0A1%' +
                    '20PETER%0A2%20PETER%0A1%20JOHN%0A2%20JOHN%0A3%20JOHN%0A' +
                    'JUDE%0AREVELATION&op=translate'
                } target='_blank'>
                    Translate
                </a>
            </div>
        </div>
    );
}

export function genBibleBooksMapXMLInput(
    numbers: string[], locale: string, onChange: (numbers: string[]) => void,
) {
    return (
        <BibleBooksMapXMLInputComp
            defaultVale={numbers.join('\n')}
            onChange={(newValue) => {
                onChange(newValue.split('\n'));
            }}
            locale={locale}
        />
    );
}

export const xmlFormatExample = `<?xml version="1.0" encoding="UTF-8"?>
<bible
    title="Example Bible Translation Version"
    // [name] optional alternative to title
    name="Example Bible Translation Version"
    // [translation] optional alternative to title
    translation="Example Bible Translation Version"
    // "key" is important for identifying ever bible
    //  the application will popup input key if it is not found
    key="EBTV"
    // [abbr] optional alternative to key
    abbr="EBTV"
    version="1"
    // e.g: for Khmer(km) locale="km"
    locale="en"
    legalNote="Example of legal note"
    // [status] optional alternative to legalNote
    status="Example of legal note"
    publisher="Example of publisher"
    copyRights="Example copy rights">
    <map>
        // e.g: for Khmer(km) value="លោកុ‌ប្បត្តិ" for value="GEN"
        <book key="GEN" value="GENESIS"/>
        <book key="EXO" value="EXODUS"/>
        <book key="LEV" value="LEVITICUS"/>
        <book key="NUM" value="NUMBERS"/>
        <book key="DEU" value="DEUTERONOMY"/>
        <book key="JOS" value="JOSHUA"/>
        <book key="JDG" value="JUDGES"/>
        <book key="RUT" value="RUTH"/>
        <book key="1SA" value="1 SAMUEL"/>
        <book key="2SA" value="2 SAMUEL"/>
        <book key="1KI" value="1 KINGS"/>
        <book key="2KI" value="2 KINGS"/>
        <book key="1CH" value="1 CHRONICLES"/>
        <book key="2CH" value="2 CHRONICLES"/>
        <book key="EZR" value="EZRA"/>
        <book key="NEH" value="NEHEMIAH"/>
        <book key="EST" value="ESTHER"/>
        <book key="JOB" value="JOB"/>
        <book key="PSA" value="PSALM"/>
        <book key="PRO" value="PROVERBS"/>
        <book key="ECC" value="ECCLESIASTES"/>
        <book key="SNG" value="SONG OF SOLOMON"/>
        <book key="ISA" value="ISAIAH"/>
        <book key="JER" value="JEREMIAH"/>
        <book key="LAM" value="LAMENTATIONS"/>
        <book key="EZK" value="EZEKIEL"/>
        <book key="DAN" value="DANIEL"/>
        <book key="HOS" value="HOSEA"/>
        <book key="JOL" value="JOEL"/>
        <book key="AMO" value="AMOS"/>
        <book key="OBA" value="OBADIAH"/>
        <book key="JON" value="JONAH"/>
        <book key="MIC" value="MICAH"/>
        <book key="NAM" value="NAHUM"/>
        <book key="HAB" value="HABAKKUK"/>
        <book key="ZEP" value="ZEPHANIAH"/>
        <book key="HAG" value="HAGGAI"/>
        <book key="ZEC" value="ZECHARIAH"/>
        <book key="MAL" value="MALACHI"/>
        <book key="MAT" value="MATTHEW"/>
        <book key="MRK" value="MARK"/>
        <book key="LUK" value="LUKE"/>
        <book key="JHN" value="JOHN"/>
        <book key="ACT" value="ACTS"/>
        <book key="ROM" value="ROMANS"/>
        <book key="1CO" value="1 CORINTHIANS"/>
        <book key="2CO" value="2 CORINTHIANS"/>
        <book key="GAL" value="GALATIANS"/>
        <book key="EPH" value="EPHESIANS"/>
        <book key="PHP" value="PHILIPPIANS"/>
        <book key="COL" value="COLOSSIANS"/>
        <book key="1TH" value="1 THESSALONIANS"/>
        <book key="2TH" value="2 THESSALONIANS"/>
        <book key="1TI" value="1 TIMOTHY"/>
        <book key="2TI" value="2 TIMOTHY"/>
        <book key="TIT" value="TITUS"/>
        <book key="PHM" value="PHILEMON"/>
        <book key="HEB" value="HEBREWS"/>
        <book key="JAS" value="JAMES"/>
        <book key="1PE" value="1 PETER"/>
        <book key="2PE" value="2 PETER"/>
        <book key="1JN" value="1 JOHN"/>
        <book key="2JN" value="2 JOHN"/>
        <book key="3JN" value="3 JOHN"/>
        <book key="JUD" value="JUDE"/>
        <book key="REV" value="REVELATION"/>
        // e.g: for Khmer(km) value="១" for value="1"
        <number key="0" value="0"/>
        <number value="0" value="1"/>
        <number key="2" value="2"/>
        <number key="3" value="3"/>
        <number key="4" value="4"/>
        <number key="5" value="5"/>
        <number key="6" value="6"/>
        <number key="7" value="7"/>
        <number key="8" value="8"/>
        <number key="9" value="9"/>
    </map>
    <testament name="Old">
        <book number="1">
            <chapter number="1">
                // eslint-disable-next-line max-len
                <verse number="1">
                    This is verse text of chapter 1 in book 1
                </verse>
            </chapter>
        </book>
    </testament>
    <testament name="New">
        <book number="40">
            <chapter number="2">
                <verse number="1">
                    This is verse text of chapter 2 in book 40
                </verse>
            </chapter>
        </book>
    </testament>
    <book number="3">
        <chapter number="3">
            <verse number="1">This is verse text of chapter 3 in book 3</verse>
        </chapter>
    </book>
</bible>`;
