import { Category, DriveFile } from '../types';
import { BEYQUNYA_FILES } from './beyqunyaData';
import { MUTEMIMETUL_UJRUMYA_FILES } from './mutemimetulUjrumyaData';
import { IRSHAD_FILES } from './irshadData';
import { KASHFU_SHUBHA_FILES } from './kashfuShubhaData';
import { KHUZ_AQIDEK_FILES } from './khuzAqidekData';
import { AL_WAJIBATH_FILES } from './alWajibathData';
import { TENBIHAT_FILES } from './tenbihatData';



// Helper to get direct download links from Google Drive
const getDirectLink = (id: string) => `https://drive.google.com/uc?id=${id}&export=download`;

const HAMEWYA_FILES: DriveFile[] = [
    {
        id: 'hamewya-pdf',
        name: 'ሃመውያ.pdf',
        type: 'pdf',
        url: getDirectLink('1BfYQQGtAF9Xs1ZxGzeJ17zn8jRjTYYc1'),
    },
    { id: 'hamewya-1', name: 'ሃመውያ ደርስ 1.mp3', type: 'audio', url: getDirectLink('1I9Ujp0wUSPSOLm_kp7z6IST08IEZLE1T') },
    { id: 'hamewya-2', name: 'ሃመውያ ደርስ 2.mp3', type: 'audio', url: getDirectLink('11RScojtVQYSRLZCQ9RIOxJJ496XRSdEV') },
    { id: 'hamewya-3', name: 'ሃመውያ ደርስ 3.mp3', type: 'audio', url: getDirectLink('1ay7Y4eCDbPiV5QY-eF-graeIwrNfAgm8') },
    // Index 4 was empty in the request
    { id: 'hamewya-5', name: 'ሃመውያ ደርስ 5.mp3', type: 'audio', url: getDirectLink('1p1i8k-6UlOJKBWpld_2LbiND84PL1Dam') },
    { id: 'hamewya-6', name: 'ሃመውያ ደርስ 6.mp3', type: 'audio', url: getDirectLink('1tzEPMMC8bEkUDJ92hBaUnDW3N53Lvi1h') },
    { id: 'hamewya-7', name: 'ሃመውያ ደርስ 7.mp3', type: 'audio', url: getDirectLink('1F8jN8oR3xX1ZvRPZndW1sd7oF77U6br_') },
    { id: 'hamewya-8', name: 'ሃመውያ ደርስ 8.mp3', type: 'audio', url: getDirectLink('1HsDgTGiSgQOP41jsj6ZNLJI3hbeIdPip') },
    { id: 'hamewya-9', name: 'ሃመውያ ደርስ 9.mp3', type: 'audio', url: getDirectLink('1lZ-fl8xN9TXWLqM4sMnYgP5A_YmtEwF7') },
    { id: 'hamewya-10', name: 'ሃመውያ ደርስ 10.mp3', type: 'audio', url: getDirectLink('152KIBLAOituAthORlNbEytp-XEkG2cmy') },
    { id: 'hamewya-11', name: 'ሃመውያ ደርስ 11.mp3', type: 'audio', url: getDirectLink('1k0vlHrXUDZOXbwvX8viwQiydAbwF3z4L') },
    { id: 'hamewya-12', name: 'ሃመውያ ደርስ 12.mp3', type: 'audio', url: getDirectLink('1qNCVV5Ca1HUHEybLY0Ft33zo50k6fU2j') },
    { id: 'hamewya-13', name: 'ሃመውያ ደርስ 13.mp3', type: 'audio', url: getDirectLink('15N7gf7R-mGA6X2Gp7WwO3NA5vk4_AFUs') },
    { id: 'hamewya-14', name: 'ሃመውያ ደርስ 14.mp3', type: 'audio', url: getDirectLink('15N7gf7R-mGA6X2Gp7WwO3NA5vk4_AFUs') },
    { id: 'hamewya-15', name: 'ሃመውያ ደርስ 15.mp3', type: 'audio', url: getDirectLink('1Vw2lT_cthcbZkL_9D4J-vXEPG3iVzpyM') },
    { id: 'hamewya-16', name: 'ሃመውያ ደርስ 16.mp3', type: 'audio', url: getDirectLink('1coK9Xq-0E2f4L959OqV1EPBe9jhvintV') },
    { id: 'hamewya-17', name: 'ሃመውያ ደርስ 17.mp3', type: 'audio', url: getDirectLink('160s7-OhSA8N1z0PQ7zzqaWwWjWI4NzN6') },
    { id: 'hamewya-18', name: 'ሃመውያ ደርስ 18.mp3', type: 'audio', url: getDirectLink('1JTkKe6ewtPqvdys3IPNX90RIU-FtHGzi') },
    { id: 'hamewya-19', name: 'ሃመውያ ደርስ 19.mp3', type: 'audio', url: getDirectLink('1vvOVSSlXguOAa7-47xlhQKMPmWlpG4GT') },
    { id: 'hamewya-20', name: 'ሃመውያ ደርስ 20.mp3', type: 'audio', url: getDirectLink('15ml_c5Rph5d9hwAJVRPajAxbCRzj06Z2') },
];



export const DRIVE_FILES = [...HAMEWYA_FILES, ...IRSHAD_FILES, ...BEYQUNYA_FILES, ...MUTEMIMETUL_UJRUMYA_FILES, ...KASHFU_SHUBHA_FILES, ...KHUZ_AQIDEK_FILES, ...AL_WAJIBATH_FILES, ...TENBIHAT_FILES];
export const ALL_FILES = DRIVE_FILES;

export const CATEGORIES: Category[] = [
    {
        id: 'khuz-aqidek',
        title: 'ኹዝ አቂደተክ',
        description: 'የኹዝ አቂደተክ ደርስ ስብስቦች',
        files: KHUZ_AQIDEK_FILES,
    },
    {
        id: 'hamewya',
        title: 'ሃመውያ',
        description: 'የሃመውያ ደርስ ስብስቦች',
        files: HAMEWYA_FILES,
    },
    {
        id: 'irshad',
        title: 'ኢርሻድ',
        description: 'የኢርሻድ ደርስ ስብስቦች',
        files: IRSHAD_FILES,
    },
    {
        id: 'beyqunya',
        title: 'ሸርህ መንዙመቱል በይቁንያ',
        description: 'የሸርህ መንዙመቱል በይቁንያ ደርስ ስብስቦች',
        files: BEYQUNYA_FILES,
    },
    {
        id: 'mutemimetul-ujrumya',
        title: 'ሙተሚመቱል ኡጅሩምያ',
        description: 'የሙተሚመቱል ኡጅሩምያ ደርስ ስብስቦች',
        files: MUTEMIMETUL_UJRUMYA_FILES,
    },
    {
        id: 'kashfu-shubha',
        title: 'ሸርህ ከሽፉ ሹብሀ ሊሸህ አል-ፈውዛን',
        description: 'የሸርህ ከሽፉ ሹብሀ ሊሸህ አል-ፈውዛን ደርስ ስብስቦች',
        files: KASHFU_SHUBHA_FILES,
    },
    {
        id: 'al-wajibath',
        title: 'አል ዋጂባት',
        description: 'የአል ዋጂባት ደርስ ስብስቦች',
        files: AL_WAJIBATH_FILES,
    },
    {
        id: 'tenbihat',
        title: 'ተንቢሃት',
        description: 'የተንቢሃት ደርስ ስብስቦች',
        files: TENBIHAT_FILES,
    },

];

