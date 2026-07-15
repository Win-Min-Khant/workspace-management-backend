function Footer() {
  return (
    <footer className="border-t bg-background px-4 py-4 sm:px-6">
      <div className="flex flex-col items-center justify-between gap-2 text-xs text-muted-foreground sm:flex-row">
        <span>
          © {new Date().getFullYear()} Flowspace. All rights reserved.
        </span>
        <div className="flex items-center gap-4">
          <span>Privacy</span>
          <span>Terms</span>
          <span>Support</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
