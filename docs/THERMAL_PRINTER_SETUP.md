# Fee desk receipt printer setup

The admissions page prints admission slips on a POS-80 receipt printer plugged into the laptop by USB. The portal talks to the printer directly from the browser (WebUSB). Set up each desk laptop once, then rehearse it well before the fee days.

## What you need

- **Google Chrome or Microsoft Edge.** Safari and Firefox can't reach USB printers.
- **The portal over `https://`.** The browser blocks USB on plain `http://` pages (`localhost` is fine for development).
- **One printer per laptop**, plugged straight into the laptop, not through a hub if you can avoid it.
- **Power settings:** keep the laptop on charge and set it not to sleep during the fee days. Sleep drops the USB connection.

## Mac

Do **not** add the printer to the Mac's printers. A Mac print queue for the POS-80 fights the portal for the printer. This was one of the causes of the 2026 failures.

If the printer was added before (for example with the old `THERMAL_LINK_MAC.md` steps), remove it:

1. Open **System Settings → Printers & Scanners**. Select the POS-80, press **−**, and confirm.
2. Or in Terminal:

   ```bash
   lpstat -p            # lists the Mac's printers; look for POS-80
   cancel -a POS-80     # drops any stuck jobs
   lpadmin -x POS-80    # removes the printer
   ```

3. Unplug the printer and plug it back in.

## Windows

Windows installs its own driver for the printer and keeps it, so the browser can't use it. Replace that driver with **WinUSB**, once per laptop and printer:

1. Plug in the printer and switch it on.
2. Download **Zadig** from [zadig.akeo.ie](https://zadig.akeo.ie) and run it.
3. Choose **Options → List All Devices**.
4. In the list, pick the printer. It's usually called `POS-80`, `Printer` or `USB Printing Support`. Check the USB ID shown matches the printer (unplug it and the entry disappears).
5. Set the driver on the right to **WinUSB** and press **Replace Driver**.
6. Unplug the printer and plug it back in.

After this, other Windows programs can't print to this printer; only the portal can. To undo it, open **Device Manager**, right-click the printer, choose **Uninstall device**, tick **Delete the driver software for this device**, then unplug the printer and plug it back in.

## Connect it in the portal

1. Open the portal's **Admissions** page in Chrome or Edge.
2. In the filter bar, press **Connect printer** and choose the printer from the list.
3. The chip should read **Printer ready**. Press **Test print** and check that a sample slip comes out with a readable QR code.

The portal remembers the printer. It reconnects by itself when the page reloads or the printer is unplugged and plugged back in. **Change printer** picks a different one.

Keep **one portal tab** per laptop. A second tab can't use the printer while the first one holds it.

## If a slip doesn't print

The portal shows a dialog with the reason and a **Retry** button. It no longer switches to the browser's print window by itself.

| The dialog says                             | Do this                                                                                     |
| ------------------------------------------- | ------------------------------------------------------------------------------------------- |
| No printer was chosen                       | Press Retry and pick the printer. If it isn't in the list, check power and cable.           |
| Windows is holding the printer              | Do the [Windows](#windows) steps on this laptop.                                            |
| Another tab or program is using the printer | Close other portal tabs. On a Mac, do the [Mac](#mac) steps. Unplug it and plug it back in. |
| The printer stopped responding              | Check paper, close the cover, and check the light isn't blinking red. Press Retry.          |
| The printer was unplugged                   | Plug it back in. Press Retry.                                                               |
| This browser can't reach USB printers       | Use Chrome or Edge over `https://`.                                                         |

**Print with browser instead** opens the browser's print window. It only helps with an ordinary office printer; the receipt printer can't print from it.

## Rehearsal checklist (early January)

For every desk laptop and its printer:

- [ ] Setup above done; printer connects and the chip reads **Printer ready**.
- [ ] Test print comes out; the QR scans in the mobile app.
- [ ] Print 20 slips in a row from real-looking test admissions.
- [ ] Unplug the printer mid-session, plug it back in, and print again.
- [ ] Open the paper cover, try to print, close it, press Retry.
- [ ] Reload the page and print again without choosing the printer.
