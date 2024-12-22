{ pkgs ? import <nixpkgs> {
  overlays = [(
    self: super: {
	  yarn = super.yarn.override {
	    nodejs = pkgs.nodejs_22;
	  };
    }
  )];
} }:
  pkgs.mkShell {
    nativeBuildInputs = with pkgs; [
      nodejs_22
      yarn
    ];
}
