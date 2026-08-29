import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildFeedbackReplyMail } from "./notify-user-reply";

describe("buildFeedbackReplyMail", () => {
  it("includes category quote and reply", () => {
    const mail = buildFeedbackReplyMail({
      category: "bug",
      originalMessage: "Tombol Simpan gagal",
      reply: "Terima kasih, sudah kami cek.",
    });
    assert.match(mail.subject, /Balasan/);
    assert.match(mail.text, /Bug/);
    assert.match(mail.text, /Tombol Simpan gagal/);
    assert.match(mail.text, /Terima kasih, sudah kami cek/);
    assert.match(mail.html, /Bug/);
  });

  it("escapes HTML in quote and reply", () => {
    const mail = buildFeedbackReplyMail({
      category: "saran",
      originalMessage: "<b>hi</b>",
      reply: "<script>x</script>",
    });
    assert.match(mail.html, /&lt;b&gt;hi&lt;\/b&gt;/);
    assert.doesNotMatch(mail.html, /<script/);
  });
});
