use crate::*;

#[inline]
pub fn populate (object: &Object, fields: &[(JsValue, JsValue)]) -> Result<(), Error> {
    for (key, val) in fields.iter() {
        Reflect::set(&object, &key.into(), &val.into())?;
    }
    Ok(())
}

#[inline]
pub fn object (fields: &[(JsValue, JsValue)]) -> Result<Object, Error> {
    let object = Object::new();
    populate(&object, fields)?;
    Ok(object)
}

#[inline]
pub fn to_bytes (source: &Uint8Array) -> Vec<u8> {
    let mut bytes: Vec<u8> = vec![0u8; source.length() as usize];
    source.copy_to(&mut bytes);
    bytes
}

#[inline]
pub fn to_hex (source: &mut impl std::io::Write) -> Result<String, Error> {
    let mut output = vec![];
    source.write(&mut output)
        .map_err(|e|Error::new(&format!("{e}")))?;
    Ok(hex::encode_upper(&output))
}

#[inline]
pub fn to_hex_borsh (source: &impl BorshSerialize) -> Result<String, Error> {
    let mut output = vec![];
    source.serialize(&mut output)
        .map_err(|e|Error::new(&format!("{e}")))?;
    Ok(hex::encode_upper(&output))
}

pub trait ToJS {
    fn to_js (&self) -> Result<JsValue, Error>;
}

impl<T: ToJS> ToJS for Option<T> {
    fn to_js (&self) -> Result<JsValue, Error> {
        if let Some(value) = self {
            value.to_js()
        } else {
            Ok(JsValue::NULL)
        }
    }
}

impl ToJS for JsValue {
    fn to_js (&self) -> Result<JsValue, Error> {
        Ok(self.clone())
    }
}

impl ToJS for bool {
    fn to_js (&self) -> Result<JsValue, Error> {
        Ok((*self).into())
    }
}

impl ToJS for str {
    fn to_js (&self) -> Result<JsValue, Error> {
        Ok(self.into())
    }
}

impl ToJS for String {
    fn to_js (&self) -> Result<JsValue, Error> {
        Ok(self.into())
    }
}

impl ToJS for i32 {
    fn to_js (&self) -> Result<JsValue, Error> {
        Ok((*self).into())
    }
}

impl ToJS for i64 {
    fn to_js (&self) -> Result<JsValue, Error> {
        Ok((*self).into())
    }
}

impl ToJS for u64 {
    fn to_js (&self) -> Result<JsValue, Error> {
        Ok((*self).into())
    }
}

impl ToJS for Dec {
    fn to_js (&self) -> Result<JsValue, Error> {
        Ok(format!("{}", self).into())
    }
}

impl ToJS for Hash {
    fn to_js (&self) -> Result<JsValue, Error> {
        Ok(to_hex_borsh(&self)?.into())
    }
}

impl ToJS for Amount {
    fn to_js (&self) -> Result<JsValue, Error> {
        Ok(format!("{}", self).into())
    }
}

impl ToJS for Epoch {
    fn to_js (&self) -> Result<JsValue, Error> {
        self.0.to_js()
    }
}

impl ToJS for Address {
    fn to_js (&self) -> Result<JsValue, Error> {
        Ok(self.encode().into())
    }
}

impl ToJS for Object {
    fn to_js (&self) -> Result<JsValue, Error> {
        Ok(self.into())
    }
}

impl ToJS for Vec<Object> {
    fn to_js (&self) -> Result<JsValue, Error> {
        let array = Array::new();
        for obj in self.iter() {
            array.push(obj);
        }
        Ok(array.into())
    }
}

impl<T: ToJS> ToJS for BTreeSet<T> {
    fn to_js (&self) -> Result<JsValue, Error> {
        let set = Set::new(&JsValue::UNDEFINED);
        for value in self.iter() {
            set.add(&value.to_js()?);
        }
        Ok(set.into())
    }
}

impl<K: ToJS, V: ToJS> ToJS for BTreeMap<K, V> {
    fn to_js (&self) -> Result<JsValue, Error> {
        let object = Object::new();
        for (key, value) in self.iter() {
            Reflect::set(&object, &key.to_js()?, &value.to_js()?)?;
        }
        Ok(object.into())
    }
}

impl ToJS for TallyResult {
    fn to_js (&self) -> Result<JsValue, Error> {
        Ok(match self {
            Self::Passed   => "Passed",
            Self::Rejected => "Rejected"
        }.into())
    }
}

impl ToJS for TallyType {
    fn to_js (&self) -> Result<JsValue, Error> {
        Ok(match self {
            Self::TwoFifths                  => "TwoFifths",
            Self::OneHalfOverOneThird        => "OneHalfOverOneThird",
            Self::LessOneHalfOverOneThirdNay => "LessOneHalfOverOneThirdNay"
        }.into())
    }
}

impl ToJS for ProposalType {
    fn to_js (&self) -> Result<JsValue, Error> {
        let object = Object::new();
        match self {
            Self::Default => {
                Reflect::set(&object, &"type".into(), &"Default".into())?;
            },
            Self::DefaultWithWasm(hash) => {
                Reflect::set(&object, &"type".into(), &"DefaultWithWasm".into())?;
                Reflect::set(&object, &"hash".into(), &hash.to_js()?)?;
            },
            Self::PGFSteward(ops) => {
                let set = Set::new(&JsValue::UNDEFINED);
                for op in ops {
                    set.add(&op.to_js()?);
                }
                Reflect::set(&object, &"type".into(), &"PGFSteward".into())?;
                Reflect::set(&object, &"ops".into(), &Array::from(&set.into()).into())?;
            },
            Self::PGFPayment(actions) => {
                let set = Set::new(&JsValue::UNDEFINED);
                for op in actions {
                    set.add(&op.to_js()?);
                }
                Reflect::set(&object, &"type".into(), &"PGFPayment".into())?;
                Reflect::set(&object, &"ops".into(), &Array::from(&set.into()).into())?;
            }
        };
        Ok(object.into())
    }
}

impl ToJS for ProposalVote {
    fn to_js (&self) -> Result<JsValue, Error> {
        Ok(match self {
            Self::Yay => "Yay",
            Self::Nay => "Nay",
            Self::Abstain => "Abstain",
        }.into())
    }
}

impl<T: ToJS> ToJS for AddRemove<T> {
    fn to_js (&self) -> Result<JsValue, Error> {
        Ok(match self {
            Self::Add(value) => to_object! {
                "op"    = "Add",
                "value" = value.to_js()?,
            },
            Self::Remove(value) => to_object! {
                "op"    = "Remove",
                "value" = value.to_js()?,
            },
        }.into())
    }
}

impl ToJS for PGFAction {
    fn to_js (&self) -> Result<JsValue, Error> {
        Ok(match self {
            Self::Continuous(value) => to_object! {
                "action" = "Continuous",
                "value"  = value.to_js()?,
            },
            Self::Retro(value) => to_object! {
                "action" = "Retro",
                "value"  = value.to_js()?,
            },
        }.into())
    }
}

impl ToJS for PGFTarget {
    fn to_js (&self) -> Result<JsValue, Error> {
        Ok(match self {
            Self::Internal(target) => to_object! {
                "type"   = "Internal",
                "target" = target.target.to_js()?,
                "amount" = target.amount.to_js()?,
            },
            Self::Ibc(target) => to_object! {
                "type"       = "Ibc",
                "target"     = target.target.to_js()?,
                "amount"     = target.amount.to_js()?,
                "port_id"    = target.port_id.as_str().to_js()?,
                "channel_id" = target.channel_id.as_str().to_js()?,
            }
        }.into())
    }
}

impl ToJS for Fee {
    fn to_js (&self) -> Result<JsValue, Error> {
        Ok(to_object! {
            "amountPerGasUnit" = self.amount_per_gas_unit,
            "token"            = self.token,
        }.into())
    }
}

impl ToJS for PublicKey {
    fn to_js (&self) -> Result<JsValue, Error> {
        Ok(match self {
            Self::Ed25519(pk) => to_object! {
                "type" = "Ed25519",
                "pk"   = to_hex_borsh(pk)?,
            },
            Self::Secp256k1(pk) => to_object! {
                "type" = "Secp256k1",
                "pk"   = to_hex_borsh(pk)?,
            }
        }.into())
    }
}

impl ToJS for GasLimit {
    fn to_js (&self) -> Result<JsValue, Error> {
        let amount: Amount = (*self).into();
        amount.to_js()
    }
}

impl ToJS for DenominatedAmount {
    fn to_js (&self) -> Result<JsValue, Error> {
        self.to_string_precise().to_js()
    }
}

impl ToJS for BlockHeader {
    fn to_js (&self) -> Result<JsValue, Error> {
        Ok(to_object! {
            "version"            = self.version,
            "chainId"            = self.chain_id,
            "height"             = self.height,
            "time"               = self.time,
            "lastBlockId"        = self.last_block_id,
            "lastCommitHash"     = self.last_commit_hash,
            "dataHash"           = self.data_hash,
            "validatorsHash"     = self.validators_hash,
            "nextValidatorsHash" = self.next_validators_hash,
            "consensusHash"      = self.consensus_hash,
            "appHash"            = self.app_hash,
            "lastResultsHash"    = self.last_results_hash,
            "evidenceHash"       = self.evidence_hash,
            "proposerAddress"    = self.proposer_address,
        }.into())
    }
}

impl ToJS for BlockVersion {
    fn to_js (&self) -> Result<JsValue, Error> {
        Ok(to_object! {
            "block" = self.block,
            "app"   = self.app,
        }.into())
    }
}

impl ToJS for ChainId {
    fn to_js (&self) -> Result<JsValue, Error> {
        self.as_str().to_js()
    }
}

impl ToJS for Account {
    fn to_js (&self) -> Result<JsValue, Error> {
        Ok(to_object! {
            "owner" = self.owner,
            "token" = self.token,
        }.into())
    }
}

impl ToJS for AccountId {
    fn to_js (&self) -> Result<JsValue, Error> {
        hex::encode_upper(self.as_bytes()).to_js()
    }
}

impl ToJS for AppHash {
    fn to_js (&self) -> Result<JsValue, Error> {
        hex::encode_upper(self.as_bytes()).to_js()
    }
}

impl ToJS for TendermintHash {
    fn to_js (&self) -> Result<JsValue, Error> {
        hex::encode_upper(self.as_bytes()).to_js()
    }
}

impl ToJS for BlockId {
    fn to_js (&self) -> Result<JsValue, Error> {
        self.hash.to_js()
    }
}

impl ToJS for Time {
    fn to_js (&self) -> Result<JsValue, Error> {
        self.to_rfc3339().to_js()
    }
}

impl ToJS for BlockHeight {
    fn to_js (&self) -> Result<JsValue, Error> {
        self.value().to_js()
    }
}
