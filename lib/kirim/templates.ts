// ============================================================================
// Pustaka template pesan undangan (WhatsApp) — user tinggal pilih.
// Placeholder: {nama} = nama tamu, {pasangan} = nama mempelai, {link} = tautan.
// {pasangan} diisi otomatis saat template dipilih; {nama} & {link} diisi per
// tamu saat kirim (lihat buildMessage di utils.ts).
// ============================================================================

export interface PesanTemplate {
  id: string;
  nama: string;
  teks: string;
}

export const MESSAGE_TEMPLATES: PesanTemplate[] = [
  {
    id: 'islami-resmi',
    nama: 'Islami — Resmi',
    teks: `Assalamualaikum warahmatullahi wabarakatuh.
Bismillahirrahmanirrahim.

Kepada Yth.
Bapak/Ibu/Saudara/i
{nama}

Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami:

{pasangan}

Untuk informasi lengkap mengenai acara, silakan kunjungi tautan undangan berikut:
{link}

Merupakan suatu kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.

Mohon maaf, undangan disampaikan melalui pesan ini. Terima kasih atas perhatian dan doanya.

Wassalamualaikum warahmatullahi wabarakatuh.

Kami yang berbahagia,
{pasangan}`,
  },
  {
    id: 'islami-singkat',
    nama: 'Islami — Singkat',
    teks: `Assalamualaikum warahmatullahi wabarakatuh.

Yth. Bapak/Ibu/Saudara/i
{nama}

Tanpa mengurangi rasa hormat, kami mengundang Anda untuk menghadiri acara pernikahan kami:

{pasangan}

Detail acara & konfirmasi kehadiran:
{link}

Merupakan suatu kebahagiaan bagi kami apabila Anda berkenan hadir dan memberikan doa restu.

Wassalamualaikum warahmatullahi wabarakatuh.`,
  },
  {
    id: 'islami-hangat',
    nama: 'Islami — Hangat',
    teks: `Bismillahirrahmanirrahim.
Assalamualaikum warahmatullahi wabarakatuh.

Yth. {nama}

Dengan memohon ridho Allah SWT, kami bermaksud berbagi kabar bahagia sekaligus mengundang Anda pada pernikahan kami:

{pasangan}

Suatu kehormatan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu. Info lengkap acara:
{link}

Jazakumullahu khairan.
Wassalamualaikum warahmatullahi wabarakatuh.

Kami yang berbahagia,
{pasangan}`,
  },
  {
    id: 'umum-formal',
    nama: 'Umum — Formal',
    teks: `Kepada Yth.
Bapak/Ibu/Saudara/i
{nama}

Dengan penuh syukur dan kebahagiaan, kami mengundang Anda untuk menghadiri acara pernikahan kami:

{pasangan}

Informasi lengkap acara dan konfirmasi kehadiran dapat dilihat pada tautan berikut:
{link}

Merupakan suatu kehormatan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.

Terima kasih.

Kami yang berbahagia,
{pasangan}`,
  },
  {
    id: 'santai-modern',
    nama: 'Santai / Modern',
    teks: `Halo {nama}! 👋

Ada kabar bahagia yang ingin kami bagi — kami akan menikah! 🤍

{pasangan}

Kami tunggu kehadiran dan doa restumu ya. Semua info acara & konfirmasi kehadiran ada di sini:
{link}

Sampai jumpa di hari bahagia kami! 🌿`,
  },
  {
    id: 'singkat-sopan',
    nama: 'Singkat & Sopan',
    teks: `Yth. {nama}

Kami mengundang Anda untuk hadir di pernikahan kami, {pasangan}.

Undangan & konfirmasi kehadiran:
{link}

Ditunggu kehadirannya, terima kasih 🙏`,
  },
];
