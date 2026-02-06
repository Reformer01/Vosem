{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  packages = with pkgs; [
    openssh     # For SSH access to GitHub
    nodejs-20_x # Required for your Next.js project
  ];
}
