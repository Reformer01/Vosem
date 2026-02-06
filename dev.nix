{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  # The dev environment packages
  packages = with pkgs; [
    nodejs_20
    openssh
  ];
}
