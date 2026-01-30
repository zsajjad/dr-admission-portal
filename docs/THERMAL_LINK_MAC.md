# Connecting POS-80 Thermal Printer on macOS

## Prerequisites

- POS-80 thermal printer connected via USB
- macOS with CUPS (pre-installed)

## Step 1: Find Connected USB Printers

```bash
lpinfo -v | grep -i usb
```

Example output:

```
direct usb://Printer/POS-80?location=1100000
```

## Step 2: List Available Generic Drivers

```bash
lpinfo -m | grep -i generic
```

Example output:

```
drv:///sample.drv/generpcl.ppd Generic PCL Laser Printer
drv:///sample.drv/generic.ppd Generic PostScript Printer
```

## Step 3: Add the Printer

```bash
lpadmin -p "POS-80" -E -v "usb://Printer/POS-80?location=1100000" -m "drv:///sample.drv/generpcl.ppd" -D "Printer POS-80"
```

**Parameters:**

- `-p "POS-80"` — Printer name
- `-E` — Enable the printer
- `-v` — Device URI (from Step 1)
- `-m` — Driver/model (from Step 2)
- `-D` — Description

## Step 4: Enable and Accept Jobs

```bash
cupsenable POS-80 && cupsaccept POS-80
```

## Step 5: Set as Default Printer

```bash
lpoptions -d POS-80
```

## Step 6: Verify Printer Status

```bash
lpstat -p POS-80
```

Expected output:

```
printer POS-80 is idle.  enabled since ...
```

## Optional: Print a Test Page

```bash
echo "Test Print" | lp -d POS-80
```

## Troubleshooting

### List All Installed Printers

```bash
lpstat -a
```

### Remove a Printer

```bash
lpadmin -x POS-80
```

### Check CUPS Service Status

```bash
cupsctl | grep -i running
```

### View Printer Queue

```bash
lpq -P POS-80
```
