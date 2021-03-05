import { Injectable } from '@angular/core';
import { Plugins } from '@capacitor/core';
import { Subject } from 'rxjs';

const { BarcodeScanner } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class QrScannerService {
  public scanResult$ = new Subject<RegExpMatchArray>()

  constructor() { 
    BarcodeScanner.prepare();
  }

  async checkPermission() {

    // check or request permission
    const status = await BarcodeScanner.checkPermission({ force: true });

    if (status.granted) {
      // the user granted permission
      console.log("permissions granted")
      return true;
    }
    console.log("permissions not granted")
    return false;
  };

  async startScan(): Promise<string> {
    await this.checkPermission();
    this.hideBackground();// make background of WebView transparent
    const result = await BarcodeScanner.startScan(); // start scanning and wait for a result
    this.stopScan();
    // if the result has content
    if (result.hasContent) {
      return Promise.resolve(result.content);
    } else {
      throw new Error("No Barcode");
    }
  }

  async startScanRegEx(regularExpression: RegExp) {

    try {
      let scanRes = await this.startScan()
      console.log(scanRes)
      if (scanRes) {
        let match = scanRes.match(regularExpression)
        if (match) {
          this.scanResult$.next(match)
        } else {
          throw new Error("No Barcode");
        }
      }
    } catch (e) {
      switch (e) {
        case "No Barcode":
          // alert("no barcode, try again")
          break;
        case "Wrong Barcode":
          // alert("wrong barcode, try again")
          break;
        default:
      }
      this.startScanRegEx(regularExpression)
    }

  };

  stopScan() {
    this.showBackground()
    BarcodeScanner.stopScan();
  };

  hideBackground() {
    let body = document.getElementsByTagName("body")[0]
    body.style.opacity = '0';
    body.style.background = 'none';
    //ios: <html> opacity: 0;
  }

  showBackground() {
    let body = document.getElementsByTagName("body")[0]
    body.style.opacity = '';
    body.style.background = '';
  }
}
