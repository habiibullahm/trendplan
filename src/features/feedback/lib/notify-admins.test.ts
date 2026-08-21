import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildFeedbackNotifyMail,
  escapeHtml,
} from "./notify-admins";

describe("escapeHtml", () => {
  it("escapes markup-sensitive characters", () => {
    assert.equal(
      escapeHtml(`a & b <c> "d"`),
      "a &amp; b &lt;c&gt; &quot;d&quot;",
    );
  });
});

describe("buildFeedbackNotifyMail", () => {
  it("includes category, submitter, preview, and inbox link", () => {
    const mail = buildFeedbackNotifyMail({
      category: "bug",
      message: "Tombol Simpan gagal",
      submitterEmail: "user@example.com",
      inboxUrl: "https://trendplan.vercel.app/admin/feedback",
    });
    assert.match(mail.subject, /Bug/);
    assert.match(mail.text, /user@example\.com/);
    assert.match(mail.text, /Tombol Simpan gagal/);
    assert.match(mail.text, /admin\/feedback/);
    assert.match(mail.html, /user@example\.com/);
    assert.doesNotMatch(mail.html, /<script/);
  });

  it("escapes HTML in submitter and message", () => {
    const mail = buildFeedbackNotifyMail({
      category: "saran",
      message: "<b>hi</b>",
      submitterEmail: "a<b>@x.com",
      inboxUrl: "https://example.com/admin/feedback",
    });
    assert.match(mail.html, /&lt;b&gt;hi&lt;\/b&gt;/);
    assert.match(mail.html, /a&lt;b&gt;@x\.com/);
  });
});
