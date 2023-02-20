pub mod adapter;

mod byte_len;
mod uint;
mod stdlib;
mod cw;

pub use fadroma_derive_serde::{FadromaSerialize, FadromaDeserialize};
pub use byte_len::ByteLen;

use std::fmt::Display;

pub type Result<T> = std::result::Result<T, Error>;

#[derive(PartialEq, Debug)]
pub enum Error {
    EndOfStream {
        total: usize,
        read: usize,
        requested: usize
    },
    ByteLenTooLong {
        len: usize
    },
    InvalidType
}

pub trait FadromaSerialize {
    fn size_hint(&self) -> usize;
    fn to_bytes(&self, ser: &mut Serializer) -> Result<()>;
}

pub trait FadromaDeserialize: Sized {
    fn from_bytes<'a>(de: &mut Deserializer<'a>) -> Result<Self>;
}

pub trait FadromaSerializeExt: FadromaSerialize {
    fn serialize(&self) -> Result<Vec<u8>>;
}

pub struct Serializer {
    buf: Vec<u8>
}

pub struct Deserializer<'a> {
    read: usize,
    bytes: &'a [u8]
}

impl Serializer {
    #[inline]
    pub fn new() -> Self {
        Self { buf: Vec::new() }
    }

    #[inline]
    pub fn with_capacity(capacity: usize) -> Self {
        Self { buf: Vec::with_capacity(capacity) }
    }

    #[inline]
    pub fn capacity(&self) -> usize {
        self.buf.capacity()
    }

    #[inline]
    pub fn reserve(&mut self, additional: usize) {
        self.buf.reserve(additional);
    }

    #[inline]
    pub fn reserve_exact(&mut self, additional: usize) {
        self.buf.reserve_exact(additional);
    }

    #[inline]
    pub fn write(&mut self, bytes: &[u8]) {
        self.buf.extend_from_slice(bytes);
    }

    #[inline]
    pub fn write_byte(&mut self, byte: u8) {
        self.buf.push(byte);
    }

    #[inline]
    pub fn finish(self) -> Vec<u8> {
        self.buf
    }
}

impl<T: FadromaSerialize> FadromaSerializeExt for T {
    #[inline]
    fn serialize(&self) -> Result<Vec<u8>> {
        let mut ser = Serializer::with_capacity(self.size_hint());
        self.to_bytes(&mut ser)?;

        Ok(ser.finish())
    }
}

impl<'a> Deserializer<'a> {
    #[inline]
    pub fn deserialize<T: FadromaDeserialize>(&mut self) -> Result<T> {
        T::from_bytes(self)
    }

    #[inline]
    pub fn read(&mut self, n: usize) -> Result<&[u8]> {
        let upper = self.read + n;

        if upper > self.bytes.len() {
            return Err(self.end_of_stream_err(n));
        }

        let bytes = &self.bytes[self.read..upper];
        self.read += n;

        Ok(bytes)
    }

    #[inline]
    pub fn read_byte(&mut self) -> Result<u8> {
        Ok(self.read(1)?[0])
    }

    #[inline]
    pub fn len(&self) -> usize {
        self.bytes.len()
    }

    #[inline]
    pub fn is_finished(&self) -> bool {
        self.read == self.bytes.len()
    }

    #[inline]
    fn end_of_stream_err(&self, requested: usize) -> Error {
        Error::EndOfStream {
            total: self.bytes.len(),
            read: self.read,
            requested
        }
    }
}

impl<'a, T: AsRef<[u8]>> From<&'a T> for Deserializer<'a> {
    fn from(bytes: &'a T) -> Self {
        Self {
            read: 0,
            bytes: bytes.as_ref()
        }
    }
}

impl Display for Error {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Error::EndOfStream { total, read, requested } => f.write_fmt(
                    format_args!(
                        "Attempted to read {} bytes but only {} remained.",
                        requested,
                        total - read
                    )
                ),
            Error::ByteLenTooLong { len } => f.write_fmt(
                format_args!("Sequence item length ({}) exceeded. Max: {}", len, ByteLen::MAX)
            ),
            Error::InvalidType => f.write_str("Invalid type.")
        }
    }
}

#[cfg(test)]
pub(crate) mod testing {
    use std::fmt::Debug;
    use super::*;

    pub fn serde<T>(item: &T)
        where T: FadromaSerialize + FadromaDeserialize + PartialEq + Debug
    {
        let bytes = item.serialize().unwrap();
        
        let mut de = Deserializer::from(&bytes);
        let result = de.deserialize::<T>().unwrap();

        assert_eq!(result, *item);
    }

    pub fn serde_len<T>(item: &T, byte_len: usize)
        where T: FadromaSerialize + FadromaDeserialize + PartialEq + Debug
    {
        let bytes = item.serialize().unwrap();
        assert_eq!(bytes.len(), byte_len);

        let mut de = Deserializer::from(&bytes);
        let result = de.deserialize::<T>().unwrap();

        assert_eq!(result, *item);
    }
}
