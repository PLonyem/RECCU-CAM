"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Upload,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn, heroGradientAngle, heroOverlayGradient } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import type { TranslationKey } from "@/lib/i18n";
import { HOMEPAGE_CONTENT_LIMITS, type HomepageContentInput } from "@/lib/validation/homepage-content";
import { RECCUCAM_GREEN_APPEARANCE } from "@/lib/public-appearance";

type Tab = "content" | "appearance" | "sections";
type GradientDirection = "to-r" | "to-b" | "to-br" | "to-bl";
type TextAlignment = "left" | "center" | "right";
type ButtonStyle = "solid" | "outline" | "ghost";

type HomepageContentData = HomepageContentInput;

const SECTION_VISIBILITY_FIELDS: {
  key: "showHero" | "showStats" | "showMission" | "showServices" | "showReach" | "showNews";
  labelKey: TranslationKey;
  description: string;
}[] = [
  { key: "showHero", labelKey: "admin.showHero", description: "The main banner at the top of the homepage." },
  { key: "showStats", labelKey: "admin.showStats", description: "Affiliate/member/region/year figures below the hero." },
  { key: "showMission", labelKey: "admin.showMission", description: "The four value cards (regulatory, capacity building, digitalization, protection)." },
  { key: "showReach", labelKey: "admin.showReach", description: "The region-by-region affiliate counts." },
  { key: "showNews", labelKey: "admin.showNews", description: "The three most recent published articles." },
  { key: "showServices", labelKey: "admin.showServices", description: "The closing \"Find a Credit Union\" banner." },
];

const MAX_IMAGES = 5;

const tabs: { key: Tab; labelKey: TranslationKey }[] = [
  { key: "content", labelKey: "admin.content" },
  { key: "appearance", labelKey: "admin.appearance" },
  { key: "sections", labelKey: "admin.sections" },
];

// Approved institutional shortcuts. ColorField also supports any valid hex value.
const GREEN_COLOR_PRESETS = ["#082D22", "#0D3D2E", "#124C37", "#185F43", "#267A57"];
const SURFACE_COLOR_PRESETS = ["#FFFFFF", "#FAF8F2", "#EEF7F2"];
const ACCENT_COLOR_PRESETS = ["#C58B2A", "#A56920", "#267A57"];

const OVERLAY_OPACITY_PRESETS: { value: number; label: string }[] = [
  { value: 0, label: "Transparent" },
  { value: 25, label: "Light" },
  { value: 50, label: "Medium" },
  { value: 75, label: "Strong" },
  { value: 100, label: "Solid Green" },
];

const GRADIENT_DIRECTION_OPTIONS: { value: GradientDirection; label: string; css: string }[] = [
  { value: "to-r", label: "Left to Right", css: "to right" },
  { value: "to-b", label: "Top to Bottom", css: "to bottom" },
  { value: "to-br", label: "Top-Left to Bottom-Right", css: "to bottom right" },
  { value: "to-bl", label: "Top-Right to Bottom-Left", css: "to bottom left" },
];

const TEXT_ALIGNMENT_OPTIONS: { value: TextAlignment; icon: typeof AlignLeft }[] = [
  { value: "left", icon: AlignLeft },
  { value: "center", icon: AlignCenter },
  { value: "right", icon: AlignRight },
];

const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";
const inputClass =
  "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition disabled:opacity-50";
const errorClass = "text-xs text-red-600 mt-1";
const countClass = "text-xs text-gray-400 mt-1 text-right";

function hexToCss(hex: string): string {
  return /^#[0-9A-Fa-f]{6}$/.test(hex) ? hex : "#000000";
}

// Shared by both Overlay Color and Background Color — a native color input
// paired with a synced hex text field and preset swatches.
function ColorField({
  label,
  value,
  presets,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  presets: string[];
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={hexToCss(value)}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="h-9 w-11 shrink-0 rounded border border-gray-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="#000000"
          className={cn(inputClass, "font-mono uppercase")}
        />
      </div>
      <div className="flex gap-2 mt-2">
        {presets.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => onChange(preset)}
            disabled={disabled}
            aria-label={preset}
            title={preset}
            className={cn(
              "h-6 w-6 rounded-full border-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
              value.toLowerCase() === preset.toLowerCase()
                ? "border-primary-500"
                : "border-gray-200 hover:border-gray-300"
            )}
            style={{ backgroundColor: preset }}
          />
        ))}
      </div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
        checked ? "bg-primary-500" : "bg-gray-300"
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
          checked ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );
}

function heroPreviewButtonStyle(data: HomepageContentData): React.CSSProperties {
  if (data.buttonStyle === "solid") return { backgroundColor: hexToCss(data.buttonColor), color: "#FFFFFF" };
  if (data.buttonStyle === "outline") return { backgroundColor: hexToCss(data.surfaceColor), border: `1px solid ${hexToCss(data.primaryColor)}`, color: hexToCss(data.primaryColor) };
  return { color: hexToCss(data.accentColor), textDecoration: "underline", textUnderlineOffset: "2px" };
}

function HeroPreview({ data }: { data: HomepageContentData }) {
  const { t } = useLanguage();
  const bgImage = data.heroImages[0];
  const gradientCss = GRADIENT_DIRECTION_OPTIONS.find(
    (o) => o.value === data.gradientDirection
  )?.css;

  const alignItems =
    data.textAlignment === "center"
      ? "items-center text-center"
      : data.textAlignment === "right"
      ? "items-end text-right"
      : "items-start text-left";
  const justifyButtons =
    data.textAlignment === "center"
      ? "justify-center"
      : data.textAlignment === "right"
      ? "justify-end"
      : "justify-start";

  // Mirrors HomeClient.tsx's own readability fallback: a thin/absent
  // overlay leaves text sitting directly on a bright photo, so give it a
  // shadow to fall back on below 30% — matches what actually ships.
  const effectiveOpacity = data.showOverlay ? data.overlayOpacity : 0;
  const textShadowStyle = effectiveOpacity < 30 ? { textShadow: "0 2px 4px rgba(0,0,0,0.3)" } : undefined;

  if (!data.showHero) {
    return (
      <div className="lg:sticky lg:top-6">
        <p className={labelClass}>{t("admin.livePreview")}</p>
        <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center p-4">
          <p className="text-xs text-gray-400 text-center">
            The hero section is hidden — nothing here will show on the homepage.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:sticky lg:top-6">
      <p className={labelClass}>{t("admin.livePreview")}</p>
      <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-gray-200 bg-gray-900">
        <div
          className="absolute inset-0"
          style={
            bgImage
              ? { backgroundImage: `url(${bgImage})`, backgroundSize: "cover", backgroundPosition: "center" }
              : {
                  backgroundImage: `linear-gradient(${gradientCss}, ${hexToCss(data.backgroundColor)}, ${hexToCss(data.secondaryColor)})`,
                }
          }
        />
        {data.showOverlay && data.overlayOpacity > 0 && (
          <div
            className="absolute inset-0"
            style={{ background: heroOverlayGradient(hexToCss(data.overlayColor), data.overlayOpacity, heroGradientAngle(data.gradientDirection), 30, 65) }}
          />
        )}
        <div className={cn("absolute inset-0 flex flex-col justify-center gap-1.5 p-4", alignItems)}>
          <p
            className="text-white/70 text-[9px] font-semibold uppercase tracking-wide"
            style={textShadowStyle}
          >
            {data.heroBadge || "Badge text"}
          </p>
          <p className="whitespace-pre-line text-white font-bold text-sm leading-tight" style={textShadowStyle}>
            {data.heroTitle || "Headline"}
          </p>
          <p
            className="text-white/80 text-[10px] leading-snug line-clamp-2 max-w-[85%]"
            style={textShadowStyle}
          >
            {data.heroSubtitle || "Subtitle"}
          </p>
          <div className={cn("flex gap-1.5 mt-1.5", justifyButtons)}>
            <span
              className="px-2.5 py-1 rounded text-[9px] font-semibold transition-colors"
              style={heroPreviewButtonStyle(data)}
            >
              {data.primaryButtonText || "Primary"}
            </span>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between border-t px-4 py-2" style={{ backgroundColor: hexToCss(data.surfaceColor), borderColor: hexToCss(data.secondaryColor) }}>
          <span className="text-[9px] font-semibold uppercase" style={{ color: hexToCss(data.accentColor) }}>Institutional section</span>
          <span className="text-[9px] font-semibold underline" style={{ color: hexToCss(data.primaryColor) }}>Public link</span>
        </div>
      </div>
      <div className="flex items-center justify-between rounded-b-lg px-4 py-2 text-[9px] text-white" style={{ backgroundColor: hexToCss(data.footerBackgroundColor) }}>
        <span>RECCU-CAM footer</span><span style={{ color: hexToCss(data.accentColor) }}>Contact</span>
      </div>
    </div>
  );
}

export default function AdminHomepageEditorPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>("content");
  const [data, setData] = useState<HomepageContentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMode, setSaveMode] = useState<"draft" | "publish" | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let ignore = false;
    fetch("/api/admin/homepage")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then((d: HomepageContentData) => {
        if (!ignore) setData(d);
      })
      .catch(() => {
        if (!ignore) setToast({ type: "error", message: "Could not load homepage content." });
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function updateField<K extends keyof HomepageContentData>(
    key: K,
    value: HomepageContentData[K]
  ) {
    setData((prev) => (prev ? { ...prev, [key]: value } : prev));
    setFieldErrors((previous) => {
      if (!previous[key]) return previous;
      const next = { ...previous };
      delete next[key];
      return next;
    });
  }

  function applyGreenPreset() {
    setData((previous) => previous ? { ...previous, ...RECCUCAM_GREEN_APPEARANCE } : previous);
    setFieldErrors({});
    setToast({ type: "success", message: "RECCU-CAM Green preset applied. Save or publish to keep it." });
  }

  async function handleAddImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !data) return;
    if (data.heroImages.length >= MAX_IMAGES) {
      setToast({ type: "error", message: `You can only add up to ${MAX_IMAGES} images.` });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/admin/homepage/upload-hero-image", {
      method: "POST",
      body: formData,
    });
    const body = await res.json().catch(() => null);
    setIsUploading(false);

    if (!res.ok) {
      setToast({ type: "error", message: body?.error ?? "Upload failed." });
      return;
    }
    updateField("heroImages", [...data.heroImages, body.url as string]);
  }

  function removeImage(index: number) {
    if (!data) return;
    updateField(
      "heroImages",
      data.heroImages.filter((_, i) => i !== index)
    );
  }

  function moveImage(index: number, direction: -1 | 1) {
    if (!data) return;
    const target = index + direction;
    if (target < 0 || target >= data.heroImages.length) return;
    const next = [...data.heroImages];
    [next[index], next[target]] = [next[target], next[index]];
    updateField("heroImages", next);
  }

  async function handleSave(mode: "draft" | "publish") {
    if (!data) return;
    setIsSaving(true);
    setSaveMode(mode);
    setFieldErrors({});
    setToast(null);

    let res: Response;
    let body: Record<string, unknown> | null;
    try {
      res = await fetch(`/api/admin/homepage?mode=${mode}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      body = await res.json().catch(() => null) as Record<string, unknown> | null;
    } catch {
      setToast({ type: "error", message: "Network error. Please check your connection and retry." });
      return;
    } finally {
      setIsSaving(false);
      setSaveMode(null);
    }

    if (!res.ok) {
      const details = (body?.errors ?? (body?.details as { fieldErrors?: unknown } | undefined)?.fieldErrors) as Record<string, string[] | undefined> | undefined;
      const nextErrors: Record<string, string> = {};
      if (details) {
        for (const [field, messages] of Object.entries(details)) {
          if (messages?.[0]) nextErrors[field] = messages[0];
        }
      }
      setFieldErrors(nextErrors);
      setToast({ type: "error", message: typeof body?.error === "string" ? body.error : "Unable to save changes." });
      return;
    }

    setData(body as unknown as HomepageContentData);
    setToast({ type: "success", message: mode === "draft" ? "Draft saved successfully." : "Homepage published successfully." });
  }

  return (
    <div className="max-w-5xl pb-24">
      <h1 className="text-2xl font-bold text-gray-900">{t("admin.homepageEditor")}</h1>
      <p className="text-sm text-gray-500 mt-1">
        Manage the content and appearance of the public homepage.
      </p>

      <div className="mt-6 border-b border-gray-200 flex gap-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "pb-3 text-sm font-medium border-b-2 -mb-px transition-colors",
              activeTab === tab.key
                ? "border-primary-500 text-primary-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            {t(tab.labelKey)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="mt-8 text-sm text-gray-400">{t("loading_text")}</div>
      ) : !data ? (
        <div className="mt-8 text-sm text-red-600">Could not load homepage content.</div>
      ) : activeTab === "sections" ? (
        <div className="mt-8 grid lg:grid-cols-[1fr_320px] gap-8 items-start">
          <Card className="divide-y divide-gray-100 min-w-0">
            <div className="px-6 py-4 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-900">{t("admin.sectionVisibility")}</p>
            </div>
            {SECTION_VISIBILITY_FIELDS.map(({ key, labelKey, description }) => (
              <div key={key} className="flex items-center justify-between gap-4 px-6 py-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900">{t(labelKey)}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{description}</p>
                </div>
                <Toggle
                  checked={data[key]}
                  onChange={(checked) => updateField(key, checked)}
                  label={t(labelKey)}
                />
              </div>
            ))}
          </Card>
          <HeroPreview data={data} />
        </div>
      ) : activeTab === "appearance" ? (
        <div className="mt-8 grid lg:grid-cols-[1fr_320px] gap-8 items-start">
          <div className="space-y-8 min-w-0">
            <Card className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div><h2 className="font-semibold text-gray-900">RECCU-CAM Green</h2><p className="mt-1 text-sm text-gray-500">Apply the approved institutional green, white, and restrained gold system.</p></div>
              <button type="button" onClick={applyGreenPreset} className="shrink-0 rounded-lg px-4 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: RECCUCAM_GREEN_APPEARANCE.primaryColor }}>Apply preset</button>
            </Card>

            <Card className="p-6 space-y-5">
              <div><h2 className="font-semibold text-gray-900">Public brand palette</h2><p className="mt-1 text-sm text-gray-500">Controls navigation accents, public surfaces, links, and the footer.</p></div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div><ColorField label="Primary green" value={data.primaryColor} presets={GREEN_COLOR_PRESETS} onChange={(value) => updateField("primaryColor", value)} />{fieldErrors.primaryColor && <p className={errorClass}>{fieldErrors.primaryColor}</p>}</div>
                <div><ColorField label="Supporting green" value={data.secondaryColor} presets={GREEN_COLOR_PRESETS} onChange={(value) => updateField("secondaryColor", value)} />{fieldErrors.secondaryColor && <p className={errorClass}>{fieldErrors.secondaryColor}</p>}</div>
                <div><ColorField label="Accent" value={data.accentColor} presets={ACCENT_COLOR_PRESETS} onChange={(value) => updateField("accentColor", value)} />{fieldErrors.accentColor && <p className={errorClass}>{fieldErrors.accentColor}</p>}</div>
                <div><ColorField label="Public surface" value={data.surfaceColor} presets={SURFACE_COLOR_PRESETS} onChange={(value) => updateField("surfaceColor", value)} />{fieldErrors.surfaceColor && <p className={errorClass}>{fieldErrors.surfaceColor}</p>}</div>
                <div className="sm:col-span-2"><ColorField label="Footer background" value={data.footerBackgroundColor} presets={GREEN_COLOR_PRESETS} onChange={(value) => updateField("footerBackgroundColor", value)} />{fieldErrors.footerBackgroundColor && <p className={errorClass}>{fieldErrors.footerBackgroundColor}</p>}</div>
              </div>
            </Card>

            {/* SECTION 1: OVERLAY CONTROLS */}
            <Card className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">{t("admin.overlayControls")}</h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">{t("admin.showOverlay")}</span>
                  <Toggle
                    checked={data.showOverlay}
                    onChange={(checked) => updateField("showOverlay", checked)}
                    label={t("admin.showOverlay")}
                  />
                </div>
              </div>

              <ColorField
                label={t("admin.overlayColor")}
                value={data.overlayColor}
                presets={GREEN_COLOR_PRESETS}
                onChange={(v) => updateField("overlayColor", v)}
                disabled={!data.showOverlay}
              />
              {fieldErrors.overlayColor && <p className={errorClass}>{fieldErrors.overlayColor}</p>}

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className={cn(labelClass, "mb-0")}>{t("admin.overlayOpacity")}</label>
                  <span className="text-sm font-semibold text-primary-700 tabular-nums">
                    {data.overlayOpacity}%
                  </span>
                </div>

                <div className={cn("relative h-5 flex items-center", !data.showOverlay && "opacity-50")}>
                  <div className="absolute inset-x-0 h-2 bg-gray-200 rounded-full" />
                  <div
                    className="absolute left-0 h-2 bg-primary-500 rounded-full transition-[width] duration-150"
                    style={{ width: `${data.overlayOpacity}%` }}
                  />
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={data.overlayOpacity}
                    onChange={(e) => updateField("overlayOpacity", Number(e.target.value))}
                    disabled={!data.showOverlay}
                    className="styled-range relative w-full disabled:cursor-not-allowed"
                  />
                </div>

                <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                  <span>0% = transparent</span>
                  <span>100% = solid green</span>
                </div>
                {fieldErrors.overlayOpacity && <p className={errorClass}>{fieldErrors.overlayOpacity}</p>}

                <div className="flex flex-wrap gap-2 mt-3">
                  {OVERLAY_OPACITY_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => updateField("overlayOpacity", preset.value)}
                      disabled={!data.showOverlay}
                      className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-medium border transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                        data.overlayOpacity === preset.value
                          ? "bg-primary-500 border-primary-500 text-white"
                          : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
                      )}
                    >
                      {preset.value}% ({preset.label})
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* SECTION 2: BACKGROUND CONTROLS */}
            <Card className="p-6 space-y-5">
              <h2 className="font-semibold text-gray-900">{t("admin.backgroundControls")}</h2>

              <ColorField
                label={t("admin.backgroundColor")}
                value={data.backgroundColor}
                presets={GREEN_COLOR_PRESETS}
                onChange={(v) => updateField("backgroundColor", v)}
              />
              {fieldErrors.backgroundColor && <p className={errorClass}>{fieldErrors.backgroundColor}</p>}

              <div>
                <label htmlFor="gradientDirection" className={labelClass}>
                  {t("admin.gradientDirection")}
                </label>
                <select
                  id="gradientDirection"
                  value={data.gradientDirection}
                  onChange={(e) => updateField("gradientDirection", e.target.value as GradientDirection)}
                  className={inputClass}
                >
                  {GRADIENT_DIRECTION_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {fieldErrors.gradientDirection && (
                  <p className={errorClass}>{fieldErrors.gradientDirection}</p>
                )}
              </div>
            </Card>

            {/* SECTION 3: TEXT CONTROLS */}
            <Card className="p-6 space-y-5">
              <h2 className="font-semibold text-gray-900">{t("admin.textControls")}</h2>

              <div>
                <label className={labelClass}>{t("admin.textAlignment")}</label>
                <div className="flex gap-2">
                  {TEXT_ALIGNMENT_OPTIONS.map(({ value, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => updateField("textAlignment", value)}
                      aria-label={`Align ${value}`}
                      aria-pressed={data.textAlignment === value}
                      className={cn(
                        "flex-1 flex items-center justify-center py-2.5 rounded-lg border transition-colors",
                        data.textAlignment === value
                          ? "border-primary-500 bg-primary-50 text-primary-700"
                          : "border-gray-300 text-gray-500 hover:bg-gray-50"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </button>
                  ))}
                </div>
                {fieldErrors.textAlignment && <p className={errorClass}>{fieldErrors.textAlignment}</p>}
              </div>
            </Card>

            {/* SECTION 4: BUTTON CONTROLS */}
            <Card className="p-6 space-y-5">
              <h2 className="font-semibold text-gray-900">{t("admin.buttonControls")}</h2>

              <div>
                <label htmlFor="buttonStyle" className={labelClass}>
                  {t("admin.buttonStyle")}
                </label>
                <select
                  id="buttonStyle"
                  value={data.buttonStyle}
                  onChange={(e) => updateField("buttonStyle", e.target.value as ButtonStyle)}
                  className={inputClass}
                >
                  <option value="solid">Solid</option>
                  <option value="outline">Outline</option>
                  <option value="ghost">Ghost</option>
                </select>
                {fieldErrors.buttonStyle && <p className={errorClass}>{fieldErrors.buttonStyle}</p>}
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div><ColorField label="Primary button" value={data.buttonColor} presets={GREEN_COLOR_PRESETS} onChange={(value) => updateField("buttonColor", value)} />{fieldErrors.buttonColor && <p className={errorClass}>{fieldErrors.buttonColor}</p>}</div>
                <div><ColorField label="Button hover" value={data.buttonHoverColor} presets={GREEN_COLOR_PRESETS} onChange={(value) => updateField("buttonHoverColor", value)} />{fieldErrors.buttonHoverColor && <p className={errorClass}>{fieldErrors.buttonHoverColor}</p>}</div>
              </div>
            </Card>
          </div>

          <HeroPreview data={data} />
        </div>
      ) : (
        <div className="mt-8 grid lg:grid-cols-[1fr_320px] gap-8 items-start">
          <div className="space-y-8 min-w-0">
          {/* SECTION 1: HERO IMAGES */}
          <Card className="p-6">
            <h2 className="font-semibold text-gray-900">{t("admin.heroImages")}</h2>
            <p className="text-sm text-gray-500 mt-1">
              Upload 1-5 images. Multiple images create an automatic slideshow
              every 10 seconds.
            </p>

            {data.heroImages.length === 0 ? (
              <p className="text-sm text-gray-400 mt-4">
                No images yet. The hero will use a gradient background.
              </p>
            ) : (
              <div className="flex flex-wrap gap-4 mt-4">
                {data.heroImages.map((url, index) => (
                  <div key={url + index} className="group relative">
                    <div className="relative w-32 h-20 rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={url}
                        alt={`Hero image ${index + 1}`}
                        fill
                        sizes="128px"
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        aria-label="Remove image"
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[11px] text-gray-500">
                      <button
                        type="button"
                        onClick={() => moveImage(index, -1)}
                        disabled={index === 0}
                        className="inline-flex items-center gap-0.5 hover:text-primary-600 disabled:opacity-30 disabled:hover:text-gray-500"
                      >
                        <ChevronLeft className="h-3 w-3" />
                        Move Left
                      </button>
                      <button
                        type="button"
                        onClick={() => moveImage(index, 1)}
                        disabled={index === data.heroImages.length - 1}
                        className="inline-flex items-center gap-0.5 hover:text-primary-600 disabled:opacity-30 disabled:hover:text-gray-500"
                      >
                        Move Right
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAddImage}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || data.heroImages.length >= MAX_IMAGES}
              className="mt-4 flex items-center gap-2 border border-dashed border-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 hover:border-primary-400 hover:text-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {isUploading ? t("admin.uploading") : t("admin.addImage")}
            </button>
            <p className="text-xs text-gray-400 mt-2">Recommended size: 1920×1080px</p>
            {fieldErrors.heroImages && <p className={errorClass}>{fieldErrors.heroImages}</p>}
          </Card>

          {/* SECTION 2: HERO TEXT */}
          <Card className="p-6 space-y-5">
            <h2 className="font-semibold text-gray-900">{t("admin.heroText")}</h2>

            <div>
              <label htmlFor="heroBadge" className={labelClass}>
                Badge text
              </label>
              <input
                id="heroBadge"
                type="text"
                placeholder="Regulated by COBAC"
                value={data.heroBadge}
                onChange={(e) => updateField("heroBadge", e.target.value)}
                maxLength={HOMEPAGE_CONTENT_LIMITS.heroBadge}
                aria-invalid={Boolean(fieldErrors.heroBadge)}
                className={inputClass}
              />
              {fieldErrors.heroBadge && <p className={errorClass}>{fieldErrors.heroBadge}</p>}
              <p className={countClass}>{data.heroBadge.length}/{HOMEPAGE_CONTENT_LIMITS.heroBadge} characters</p>
            </div>

            <div>
              <label htmlFor="heroTitle" className={labelClass}>
                Headline
              </label>
              <textarea
                id="heroTitle"
                rows={2}
                value={data.heroTitle}
                onChange={(e) => updateField("heroTitle", e.target.value)}
                maxLength={HOMEPAGE_CONTENT_LIMITS.heroTitle}
                aria-invalid={Boolean(fieldErrors.heroTitle)}
                className={cn(inputClass, "text-lg font-display")}
              />
              {fieldErrors.heroTitle && <p className={errorClass}>{fieldErrors.heroTitle}</p>}
              <p className={countClass}>{data.heroTitle.length}/{HOMEPAGE_CONTENT_LIMITS.heroTitle} characters</p>
            </div>

            <div>
              <label htmlFor="heroSubtitle" className={labelClass}>
                Subtitle
              </label>
              <textarea
                id="heroSubtitle"
                rows={3}
                value={data.heroSubtitle}
                onChange={(e) => updateField("heroSubtitle", e.target.value)}
                maxLength={HOMEPAGE_CONTENT_LIMITS.heroSubtitle}
                aria-invalid={Boolean(fieldErrors.heroSubtitle)}
                className={inputClass}
              />
              {fieldErrors.heroSubtitle && <p className={errorClass}>{fieldErrors.heroSubtitle}</p>}
              <p className={countClass}>{data.heroSubtitle.length}/{HOMEPAGE_CONTENT_LIMITS.heroSubtitle} characters</p>
            </div>
          </Card>

          {/* SECTION 3: BUTTONS */}
          <Card className="p-6 space-y-5">
            <h2 className="font-semibold text-gray-900">{t("admin.buttons")}</h2>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="primaryButtonText" className={labelClass}>
                  Primary button text
                </label>
                <input
                  id="primaryButtonText"
                  type="text"
                  value={data.primaryButtonText}
                  onChange={(e) => updateField("primaryButtonText", e.target.value)}
                  maxLength={HOMEPAGE_CONTENT_LIMITS.buttonText}
                  aria-invalid={Boolean(fieldErrors.primaryButtonText)}
                  className={inputClass}
                />
                {fieldErrors.primaryButtonText && (
                  <p className={errorClass}>{fieldErrors.primaryButtonText}</p>
                )}
                <p className={countClass}>{data.primaryButtonText.length}/{HOMEPAGE_CONTENT_LIMITS.buttonText} characters</p>
              </div>
              <div>
                <label htmlFor="primaryButtonLink" className={labelClass}>
                  Primary button link
                </label>
                <input
                  id="primaryButtonLink"
                  type="text"
                  value={data.primaryButtonLink}
                  onChange={(e) => updateField("primaryButtonLink", e.target.value)}
                  maxLength={HOMEPAGE_CONTENT_LIMITS.buttonLink}
                  aria-invalid={Boolean(fieldErrors.primaryButtonLink)}
                  className={inputClass}
                />
                {data.primaryButtonLink && !data.primaryButtonLink.startsWith("/") && (
                  <p className={errorClass}>Link must start with /</p>
                )}
                {fieldErrors.primaryButtonLink && (
                  <p className={errorClass}>{fieldErrors.primaryButtonLink}</p>
                )}
                <p className={countClass}>{data.primaryButtonLink.length}/{HOMEPAGE_CONTENT_LIMITS.buttonLink} characters</p>
              </div>
              <div>
                <label htmlFor="secondaryButtonText" className={labelClass}>
                  Secondary button text
                </label>
                <input
                  id="secondaryButtonText"
                  type="text"
                  value={data.secondaryButtonText}
                  onChange={(e) => updateField("secondaryButtonText", e.target.value)}
                  maxLength={HOMEPAGE_CONTENT_LIMITS.buttonText}
                  aria-invalid={Boolean(fieldErrors.secondaryButtonText)}
                  className={inputClass}
                />
                {fieldErrors.secondaryButtonText && (
                  <p className={errorClass}>{fieldErrors.secondaryButtonText}</p>
                )}
                <p className={countClass}>{data.secondaryButtonText.length}/{HOMEPAGE_CONTENT_LIMITS.buttonText} characters</p>
              </div>
              <div>
                <label htmlFor="secondaryButtonLink" className={labelClass}>
                  Secondary button link
                </label>
                <input
                  id="secondaryButtonLink"
                  type="text"
                  value={data.secondaryButtonLink}
                  onChange={(e) => updateField("secondaryButtonLink", e.target.value)}
                  maxLength={HOMEPAGE_CONTENT_LIMITS.buttonLink}
                  aria-invalid={Boolean(fieldErrors.secondaryButtonLink)}
                  className={inputClass}
                />
                {data.secondaryButtonLink && !data.secondaryButtonLink.startsWith("/") && (
                  <p className={errorClass}>Link must start with /</p>
                )}
                {fieldErrors.secondaryButtonLink && (
                  <p className={errorClass}>{fieldErrors.secondaryButtonLink}</p>
                )}
                <p className={countClass}>{data.secondaryButtonLink.length}/{HOMEPAGE_CONTENT_LIMITS.buttonLink} characters</p>
              </div>
            </div>
          </Card>

          {/* SECTION 4: STATISTICS */}
          <Card className="p-6 space-y-5">
            <h2 className="font-semibold text-gray-900">{t("admin.statistics")}</h2>

            <div className="grid sm:grid-cols-3 gap-5">
              <div>
                <label htmlFor="statsAffiliates" className={labelClass}>
                  Affiliates count
                </label>
                <input
                  id="statsAffiliates"
                  type="number"
                  min={0}
                  value={data.statsAffiliates}
                  onChange={(e) => updateField("statsAffiliates", Number(e.target.value) || 0)}
                  className={inputClass}
                />
                {fieldErrors.statsAffiliates && (
                  <p className={errorClass}>{fieldErrors.statsAffiliates}</p>
                )}
              </div>
              <div>
                <label htmlFor="statsMembers" className={labelClass}>
                  Members count
                </label>
                <input
                  id="statsMembers"
                  type="text"
                  placeholder="1.2M+"
                  value={data.statsMembers}
                  onChange={(e) => updateField("statsMembers", e.target.value)}
                  maxLength={HOMEPAGE_CONTENT_LIMITS.statistic}
                  aria-invalid={Boolean(fieldErrors.statsMembers)}
                  className={inputClass}
                />
                {fieldErrors.statsMembers && <p className={errorClass}>{fieldErrors.statsMembers}</p>}
                <p className={countClass}>{data.statsMembers.length}/{HOMEPAGE_CONTENT_LIMITS.statistic} characters</p>
              </div>
              <div>
                <label htmlFor="statsAssets" className={labelClass}>
                  Assets count
                </label>
                <input
                  id="statsAssets"
                  type="text"
                  placeholder="550B+"
                  value={data.statsAssets}
                  onChange={(e) => updateField("statsAssets", e.target.value)}
                  maxLength={HOMEPAGE_CONTENT_LIMITS.statistic}
                  aria-invalid={Boolean(fieldErrors.statsAssets)}
                  className={inputClass}
                />
                {fieldErrors.statsAssets && <p className={errorClass}>{fieldErrors.statsAssets}</p>}
                <p className={countClass}>{data.statsAssets.length}/{HOMEPAGE_CONTENT_LIMITS.statistic} characters</p>
              </div>
            </div>
          </Card>
        </div>
        <HeroPreview data={data} />
        </div>
      )}

      {data && (
        <div className="sticky bottom-0 -mx-4 sm:-mx-6 -mb-4 sm:-mb-6 bg-white border-t border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-4 z-10">
          <div className="flex-1">
            {toast && (
              <p
                className={cn(
                  "flex items-center gap-1.5 text-sm",
                  toast.type === "success" ? "text-green-700" : "text-red-600"
                )}
              >
                {toast.type === "success" ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                {toast.message}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" target="_blank" className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">Preview published</Link>
            <Button type="button" variant="outline" onClick={() => handleSave("draft")} disabled={isSaving} className="px-4 py-2.5">
              {isSaving && saveMode === "draft" ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</> : "Save Draft"}
            </Button>
            <Button type="button" onClick={() => handleSave("publish")} disabled={isSaving} className="px-5 py-2.5">
              {isSaving && saveMode === "publish" ? <><Loader2 className="h-4 w-4 animate-spin" />Publishing...</> : "Publish"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
