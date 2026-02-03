# ViKa Style Guide

A quick reference for maintaining consistent styling across the application.

---

## Colors

### ViKa Brand Palette

```
turquoise: #3DD6D0
teal:      #1BAB9B  (primary accent)
violet:    #6677F5
coral:     #F7A9A8
yellow:    #D4D017
amber:     #F59E0B
indigo:    #4F46E5
```

### Usage

- **Tags/Badges**: `bg-vika-teal text-white` - solid teal background with white text
- **Icons**: `text-muted-foreground` - keep icons subtle, not colored
- **Text**: Use theme colors (`text-foreground`, `text-muted-foreground`) for readability

### What NOT to do

- Don't use multiple ViKa colors on the same page
- Don't use colored text for body content
- Don't use colored borders or accents excessively

---

## Layout

### Page Container

```tsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
```

### Content Width

- Full width lists/grids: No additional constraint
- Reading content (blogs, articles): `max-w-3xl`

---

## Typography

### Page Headers

```tsx
<div className="mb-8">
  <div className="flex items-center gap-3 mb-2">
    <Icon className="h-8 w-8 text-muted-foreground" />
    <h1 className="text-3xl text-foreground">Title</h1>
  </div>
  <p className="text-lg text-muted-foreground">Subtitle/description</p>
</div>
```

### Section Headings

- h2: `text-2xl text-foreground`
- h3: `text-xl text-foreground`

### Body Text

- Default: `text-base text-foreground leading-relaxed`
- Muted: `text-sm text-muted-foreground`

---

## Components

### Cards

```tsx
<Card className="cursor-pointer transition-all hover:shadow-md hover:bg-accent">
  <CardHeader>
    <CardTitle className="text-lg">{title}</CardTitle>
    <CardDescription>{description}</CardDescription>
  </CardHeader>
  <CardContent>{content}</CardContent>
</Card>
```

### Tags/Badges

```tsx
<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-vika-teal text-white">
  {tag}
</span>
```

### Meta Information (author, date)

```tsx
<div className="flex items-center gap-4 text-sm text-muted-foreground">
  <span className="flex items-center gap-1">
    <User className="h-3 w-3" />
    {author}
  </span>
  <span className="flex items-center gap-1">
    <Calendar className="h-3 w-3" />
    {date}
  </span>
</div>
```

### Back Links

```tsx
<Link
  to="/path"
  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
>
  <ArrowLeft className="h-4 w-4" />
  Back to Page
</Link>
```

---

## Loading States

### Skeletons

Use `<Skeleton />` components matching the layout structure:

```tsx
<Skeleton className="h-10 w-32 mb-2" />  // Title
<Skeleton className="h-6 w-64 mb-8" />   // Subtitle
<Skeleton className="h-4 w-full" />      // Text line
```

---

## Spacing Reference

| Use Case           | Class              |
| ------------------ | ------------------ |
| Page padding       | `py-8`             |
| Section gap        | `mb-8`             |
| Paragraph gap      | `mb-5`             |
| List item gap      | `space-y-2`        |
| Card gap in grid   | `gap-4`            |
| Inline element gap | `gap-1` to `gap-2` |

---

## Icons

- Use [Lucide React](https://lucide.dev) icons
- Header icons: `h-8 w-8`
- Inline icons: `h-4 w-4` or `h-3 w-3`
- Color: `text-muted-foreground` (not brand colors)

---

## Quick Checklist

- [ ] Page uses `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8`
- [ ] Header has icon + title + description pattern
- [ ] Tags use `bg-vika-teal text-white`
- [ ] Icons are `text-muted-foreground`
- [ ] Body text uses theme colors, not brand colors
- [ ] Loading states have skeleton placeholders
- [ ] Interactive elements have hover states
