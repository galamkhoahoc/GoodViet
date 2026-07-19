from getpass import getpass

from huggingface_hub import HfApi, login


def main() -> None:
    token = getpass("Dan token Hugging Face MOI (noi dung se bi an): ").strip()
    if not token.startswith("hf_") or len(token) < 30:
        print(f"Khong hop le: da nhan {len(token)} ky tu, tien to hf_: {token.startswith('hf_')}")
        raise SystemExit(2)

    print(f"Da nhan {len(token)} ky tu va dung tien to hf_. Dang xac minh...")
    try:
        identity = HfApi().whoami(token=token)
        login(token=token, add_to_git_credential=False)
        print(f"DANG NHAP THANH CONG: {identity.get('name', 'unknown')}")
    except Exception as error:
        print(f"TOKEN KHONG HOP LE: {error}")
        raise SystemExit(1) from error
    finally:
        token = ""


if __name__ == "__main__":
    main()
